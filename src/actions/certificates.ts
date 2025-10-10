"use server";

import { db } from "@/db";
import { hack_projects, hackathons, hackathon_results, project_certificates } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { generateCertificatePDF } from "@/lib/pdf-generator";
import pinataSDK from "@pinata/sdk";
import fs from "fs";
import path from "path";
import os from "os";
import FormData from "form-data";
import { SHA256 } from "crypto-js";

type GenerateCertificateResult = {
  success: boolean;
  fileHash?: string;
  ipfsHash?: string;
  url?: string;
  error?: string;
  alreadyExists?: boolean;
};

export async function generateCertificateForProject(projectId: string, userId?: string): Promise<GenerateCertificateResult> {
  try {
    // Fetch project, hackathon and result
    const [projectRes] = await db.select().from(hack_projects).where(eq(hack_projects.id, projectId));
    if (!projectRes) return { success: false, error: "Project not found" };

    // Check if certificate already exists for this user and project
    if (userId) {
      const existingCert = await db.select().from(project_certificates).where(
        and(
          eq(project_certificates.project_id, projectId),
          eq(project_certificates.issued_to, userId)
        )
      );
      
      if (existingCert.length > 0) {
        return { 
          success: true, 
          alreadyExists: true,
          ipfsHash: existingCert[0].ipfs_hash,
          url: existingCert[0].url || `https://gateway.pinata.cloud/ipfs/${existingCert[0].ipfs_hash}`
        };
      }
    }

    const [hackathonRes] = await db.select().from(hackathons).where(eq(hackathons.id, projectRes.hackathon_id as string));
    const [resultRes] = await db.select().from(hackathon_results).where(eq(hackathon_results.project_id, projectId));

    // Generate PDF using the separate utility
    const pdfBuffer = await generateCertificatePDF({
      recipientName: projectRes.owner_id,
      projectName: projectRes.project_name,
      hackathonName: hackathonRes?.name ?? "Hackathon",
      position: resultRes?.final_rank ? `${resultRes.final_rank}` : undefined,
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    });

    // Pin to Pinata
    const pinataJwt = process.env.PINATA_JWT;
    const pinataApiKey = process.env.PINATA_API_KEY;
    const pinataApiSecret = process.env.PINATA_API_SECRET;

    // If Pinata API keys are available, use the SDK
    if (pinataApiKey && pinataApiSecret) {
      const pinata = new pinataSDK(pinataApiKey, pinataApiSecret);

      // Pinata SDK expects a ReadableStream or a file path, not a Blob or Buffer directly.
      // Write the buffer to a temporary file, then stream it.
      const tmpDir = os.tmpdir();
      const fileName = `${projectRes.project_name}-signvault-io.pdf`;
      const filePath = path.join(tmpDir, `${Date.now()}-${fileName}`);
      await fs.promises.writeFile(filePath, pdfBuffer);

      try {
        const readableStream = fs.createReadStream(filePath);
        const response = await pinata.pinFileToIPFS(readableStream, {
          pinataMetadata: {
            name: fileName
          }
        });

        const ipfsHash = response?.IpfsHash;
        
        // Store certificate in database
        if (userId && ipfsHash) {
          await db.insert(project_certificates).values({
            project_id: projectId,
            ipfs_hash: ipfsHash,
            url: `https://gateway.pinata.cloud/ipfs/${ipfsHash}`,
            issued_by: "openwave System",
            issued_to: userId
          });
        }
        
        return {
          success: true,
          ipfsHash,
          url: ipfsHash ? `https://gateway.pinata.cloud/ipfs/${ipfsHash}` : undefined
        };
      } finally {
        // Clean up the temp file
        fs.promises.unlink(filePath).catch(() => {});
      }
    }

    // If only JWT is available, use the REST API
    if (pinataJwt) {
      // Use form-data package for Node.js
      const formData = new FormData();
      formData.append("file", pdfBuffer, {
        filename: `${projectRes.project_name}-signvault-io.pdf`,
        contentType: "application/pdf"
      });

      const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${pinataJwt}`,
          ...formData.getHeaders?.() // Only available in Node.js form-data
        },
        body: formData as any
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Pinata upload failed: ${res.status} ${txt}`);
      }

      const json = await res.json();
      const ipfsHash = json?.IpfsHash;
      // Calculate the file hash correctly: SHA256 expects a WordArray or string, not a Buffer.
      // Use CryptoJS.enc.Hex to get the hash as a hex string.
      // Convert the Buffer to a WordArray for CryptoJS:
      function bufferToWordArray(buffer: Buffer) {
        const uint8Array = new Uint8Array(buffer);
        const words = [];
        for (let i = 0; i < uint8Array.length; i += 4) {
          words.push(
            ((uint8Array[i] << 24) | 
            (uint8Array[i + 1] << 16) | 
            (uint8Array[i + 2] << 8) | 
            (uint8Array[i + 3])) >>> 0
          );
        }
        return {
          sigBytes: uint8Array.length,
          words: words
        };
      }
      const wordArray = bufferToWordArray(Buffer.isBuffer(pdfBuffer) ?
      // @ts-expect-error - pdfBuffer is a Buffer
       pdfBuffer : Buffer.from(pdfBuffer));
      // @ts-expect-error - SHA256 expects a WordArray or string, not a Buffer
      const fileHash = SHA256(wordArray).toString();
      console.log("fileHash", fileHash);
      
      // Store certificate in database
      if (userId && ipfsHash) {
        await db.insert(project_certificates).values({
          project_id: projectId,
          ipfs_hash: ipfsHash,
          url: `https://gateway.pinata.cloud/ipfs/${ipfsHash}`,
          issued_by: "openwave System",
          issued_to: userId
        });
      }
      
      return {
        fileHash,
        success: true,
        ipfsHash,
        url: ipfsHash ? `https://gateway.pinata.cloud/ipfs/${ipfsHash}` : undefined
      };
    }

    return { success: false, error: "No Pinata credentials configured" };
  } catch (error: any) {
    console.error("generateCertificateForProject error:", error);
    return { success: false, error: error?.message || String(error) };
  }
}
import { Document, Page, View, Text, Image, StyleSheet, pdf } from "@react-pdf/renderer";

// Styles for the certificate
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 40,
    fontFamily: 'Helvetica',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#64748b',
    marginBottom: 20,
  },
  content: {
    alignItems: 'center',
    marginBottom: 40,
  },
  recipientText: {
    fontSize: 16,
    marginBottom: 10,
    color: '#374151',
  },
  recipientName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
    textDecoration: 'underline',
  },
  achievementText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#374151',
    marginBottom: 10,
    lineHeight: 1.5,
  },
  projectName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 10,
  },
  hackathonName: {
    fontSize: 16,
    color: '#059669',
    marginBottom: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 'auto',
  },
  signature: {
    alignItems: 'center',
  },
  signatureText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 10,
  },
  date: {
    fontSize: 12,
    color: '#6b7280',
  },
  border: {
    border: '3px solid #2563eb',
    borderRadius: 10,
    padding: 20,
  },
});

interface CertificateProps {
  recipientName: string;
  projectName: string;
  hackathonName: string;
  position?: string;
  date: string;
}

// Certificate component
const CertificateDocument = ({ recipientName, projectName, hackathonName, position, date }: CertificateProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.border}>
        <View style={styles.header}>
          <Text style={styles.title}>Certificate of Achievement</Text>
          <Text style={styles.subtitle}>Hackathon Participation</Text>
        </View>
        
        <View style={styles.content}>
          <Text style={styles.recipientText}>This is to certify that</Text>
          <Text style={styles.recipientName}>{recipientName}</Text>
          
          <Text style={styles.achievementText}>
            has successfully participated in the hackathon project
          </Text>
          
          <Text style={styles.projectName}>{projectName}</Text>
          
          <Text style={styles.achievementText}>
            as part of
          </Text>
          
          <Text style={styles.hackathonName}>{hackathonName}</Text>
          
          {position && (
            <Text style={styles.achievementText}>
              and achieved {position} place
            </Text>
          )}
          
          <Text style={styles.achievementText}>
            This certificate recognizes their dedication, creativity, and technical skills
            demonstrated throughout the hackathon event.
          </Text>
        </View>
        
        <View style={styles.footer}>
          <View style={styles.signature}>
            <Text style={styles.signatureText}>Hackathon Organizer</Text>
          </View>
          <Text style={styles.date}>Date: {date}</Text>
        </View>
      </View>
    </Page>
  </Document>
);

// Function to generate PDF buffer
export async function generateCertificatePDF(props: CertificateProps): Promise<Buffer> {
  const doc = <CertificateDocument {...props} />;
  const pdfBuffer = await pdf(doc).toBuffer();
  return pdfBuffer;
}
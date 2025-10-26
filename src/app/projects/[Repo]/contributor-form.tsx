"use client"

import { useState, useContext } from "react"
import { useSession } from "next-auth/react"
import { useTheme } from "next-themes"
import Image from "next/image"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Textarea } from "../../../components/ui/textarea"
import { Progress } from "../../../components/ui/progress"
import { Checkbox } from "../../../components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "../../../components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select"
import { X } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "../../../components/ui/alert"
import { ThemeModalContext } from "./repo-page";
import { toast } from "sonner"

interface FormData {
  username:string
  projectName:string

  name: string
  email: string
  bio: string
  whyContribute: string
  exampleProjects: string
  languages: string[]
  frameworks: string[]
  tools: string[]
  otherSkills: string
  experienceMatrix: {
    [key: string]: {
      years: string
      rating: number
    }
  }
  resume: File | null
  samplePatches: File | null
  sshPublicKey: string
  prLinks: string
  accessLevel: string
  ndaAgreement: boolean
  twoFactorEnabled: boolean
  earliestStartDate: string
  codeOfConductAgreed: boolean
  contributionGuidelinesAgreed: boolean
  fullName: string
  signatureDate: string
// Add this missing field
}

const programmingLanguages = [
  "JavaScript",
  "Python",
  "Java",
  "C#",
  "C++",
  "Go",
  "Ruby",
  "PHP",
  "TypeScript",
  "Swift",
  "Kotlin",
  "Rust",
]
interface ContributorApplicationFormProps {
  repo: string;
}
export default function ContributorApplicationForm({repo}:ContributorApplicationFormProps) {


  const {data:session}=useSession();    
  const theme = useTheme();
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 6
  const { isOpen, setIsOpen } = useContext(ThemeModalContext);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    bio: "",
    projectName:repo,
    whyContribute: "",
    exampleProjects: "",
    languages: [],
    frameworks: [],
    tools: [],
    otherSkills: "",
    experienceMatrix: {},
    resume: null,
    samplePatches: null,
    sshPublicKey: "",
    prLinks: "",
    accessLevel: "",
    ndaAgreement: false,
    twoFactorEnabled: false,
    earliestStartDate: "",
    codeOfConductAgreed: false,
    contributionGuidelinesAgreed: false,
    fullName: "",
    signatureDate: "",
    username:session?.user?.username || "",
  })



  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleArrayChange = (field: keyof FormData, item: string) => {
    setFormData((prev) => {
      const currentArray = prev[field] as string[]
      if (currentArray.includes(item)) {
        return { ...prev, [field]: currentArray.filter((i) => i !== item) }
      } else {
        return { ...prev, [field]: [...currentArray, item] }
      }
    })
  }

  const handleExperienceChange = (
    language: string,
    key: "years" | "rating",
    value: string | number,
  ) => {
    setFormData((prev) => ({
      ...prev,
      experienceMatrix: {
        ...prev.experienceMatrix,
        [language]: {
          ...prev.experienceMatrix[language],
          [key]: value,
        },
      },
    }))
  }

  const handleFileChange = (field: keyof FormData, file: File | null) => {
    setFormData((prev) => ({ ...prev, [field]: file }))
  }

  const validateSSHKey = (key: string) => {
    // Basic validation for SSH public key format (e.g., starts with ssh-rsa, ssh-ed25519, etc.)
    return (
      key.startsWith("ssh-rsa ") ||
      key.startsWith("ssh-dss ") ||
      key.startsWith("ecdsa-sha2-nistp256 ") ||
      key.startsWith("ecdsa-sha2-nistp384 ") ||
      key.startsWith("ecdsa-sha2-nistp521 ") ||
      key.startsWith("ssh-ed25519 ")
    )
  }

  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const nextStep = () => {
    // Basic validation before moving to the next step
    if (currentStep === 1) {
      if (!formData.name || !formData.email || !formData.bio || !formData.whyContribute) {
        setAlertMessage("Please fill in all required personal information fields.");
        return;
      }
    } else if (currentStep === 2) {
      if (
        formData.languages.length === 0 &&
        formData.frameworks.length === 0 &&
        formData.tools.length === 0 &&
        !formData.otherSkills
      ) {
        setAlertMessage("Please select at least one skill or enter other skills.");
        return;
      }
    } else if (currentStep === 3) {
      // Validate experience matrix for selected languages
      for (const lang of formData.languages) {
        if (!formData.experienceMatrix[lang]?.years || !formData.experienceMatrix[lang]?.rating) {
          setAlertMessage(`Please provide years of experience and self-rating for ${lang}.`);
          return;
        }
      }
    } else if (currentStep === 4) {
      if (formData.sshPublicKey && !validateSSHKey(formData.sshPublicKey)) {
        setAlertMessage("Please enter a valid SSH public key.");
        return;
      }
    } else if (currentStep === 5) {
      if (
        !formData.accessLevel ||
        !formData.ndaAgreement ||
        !formData.twoFactorEnabled ||
        !formData.earliestStartDate
      ) {
        setAlertMessage("Please fill in all required access and preferences fields.");
        return;
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
  };

  // Render the shadcn Alert component for validation errors
  // Place this somewhere in your component's JSX, e.g. above the stepper/form
  // Example:
  // {alertMessage && (
  //   <Alert variant="destructive" className="mb-4">
  //     <AlertTitle>Validation Error</AlertTitle>
  //     <AlertDescription>{alertMessage}</AlertDescription>
  //     <Button
  //       variant="ghost"
  //       size="sm"
  //       className="absolute top-2 right-2"
  //       onClick={() => setAlertMessage(null)}
  //     >
  //       Dismiss
  //     </Button>
  //   </Alert>
  // )}

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
  try {
    // Handle file uploads first (you'll need to implement file upload logic)
    const resumeUrl = null;
    const samplePatchesUrl = null;
    
    if (formData.resume) {
      const saveResume=async() => {
        // Generate timestamp and create unique filename
        const timestamp = Date.now();
        const fileExtension = formData?.resume?.name.split('.').pop();
        const baseFileName = formData?.resume?.name.replace(/\.[^/.]+$/, "");
        const uniqueFileName = `${baseFileName}_${timestamp}.${fileExtension}`;
        
        const signedUrlResponse = await fetch ('/api/s3',{
          method:'POST',
          headers: {
                    "Content-Type": "application/json",
          },
          body:JSON.stringify({
            fileName: uniqueFileName,
            fileType:formData?.resume?.type,
          })
        })
        if (!signedUrlResponse.ok) {
                throw new Error(`Failed to get signed URL: ${signedUrlResponse.statusText}`);
            }
      const { signedUrl } = await signedUrlResponse.json();

      await fetch(signedUrl, {
                method: "PUT",
                body: formData?.resume,
                
            });
          
      }
       
      saveResume();
      
    }
    
    if (formData.samplePatches) {
      
    }

    // Generate the same timestamp and filename for the URL
    const timestamp = Date.now();
    const fileExtension = formData?.resume?.name.split('.').pop();
    const baseFileName = formData?.resume?.name.replace(/\.[^/.]+$/, "");
    const uniqueFileName = `${baseFileName}_${timestamp}.${fileExtension}`;

    const submissionData = {
      ...formData,
      resumeUrl:`https://${process.env.AWS_S3_BUCKET_NAME}.s3.tebi.io/${uniqueFileName}`,
      samplePatchesUrl,
      // Remove File objects as they can't be serialized
      resume: undefined,
      samplePatches: undefined
    };

    const response = await fetch('/api/contributor-applications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(submissionData),
    });

    const result = await response.json();

    // Use toast notifications instead of alert
    if (result.success) {
      toast.success("Application submitted successfully!");
      setIsOpen(false);
      // Reset form or redirect
    } else {
      toast.error("Error submitting application: " + result.error);
    }
  } catch (error) {
    console.error('Error submitting form:', error);
    toast.error("Error submitting application");
  }
};

  // Don't render anything if modal is not open
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex h-screen items-center justify-center">
      {/* Backdrop overlay */}
      <div 
        className="absolute  inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={() => setIsOpen(false)}
      />
      
      {/* Modal content */}
      <div className="relative dark:bg-neutral-900 bg-white rounded-lg shadow-xl w-full max-w-[90vw] max-h-[90vh] overHBAR-y-auto">
        <div className="p-6 pb-4">
          <div className="flex items-start justify-between gap-4">
            {/* Logo and Title */}
            <div className="flex flex-col items-start gap-2">
            
             <div className="dark:block hidden">
                <Image
                  src="/NeowareLogo.png"
                  alt="Company Logo"
                  width={120}
                  height={40}
                  className="mb-2"
               />
               </div>
               <div className="block dark:hidden">
                        <Image
                  src="/NeowareLogo1.png"
                  alt="Company Logo"
                  width={120}
                  height={40}
                  className="mb-2"
                />
               </div>
              <h2 className="text-2xl font-bold">Contributor Application</h2>
            </div>

            {/* Progress and Close Button */}
            <div className="flex flex-col items-end gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-gray-500 hover:text-gray-700" 
                onClick={() => setIsOpen(false)}
              >
                <X className="h-6 w-6" />
                <span className="sr-only">Close</span>
              </Button>
              <p className="text-sm text-gray-600">
                Step {currentStep} of {totalSteps}
              </p>
              <Progress value={(currentStep / totalSteps) * 100} className="h-2 w-full min-w-[150px]" />
            </div>
          </div>
        </div>
        
        {/* Form content */}
        <div className="p-6 pt-0">
          <form onSubmit={handleSubmit}>
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio *</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    rows={4}
                    placeholder="Tell us about yourself, your background, and interests..."
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whyContribute">Why do you want to contribute? *</Label>
                  <Textarea
                    id="whyContribute"
                    value={formData.whyContribute}
                    onChange={(e) => handleInputChange("whyContribute", e.target.value)}
                    rows={3}
                    placeholder="Explain your motivation for contributing to this project..."
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="exampleProjects">Example Project Descriptions</Label>
                  <Textarea
                    id="exampleProjects"
                    value={formData.exampleProjects}
                    onChange={(e) => handleInputChange("exampleProjects", e.target.value)}
                    rows={3}
                    placeholder="Describe some projects you've worked on..."
                  />
                </div>
              </div>
            )}

            {/* Step 2: Skills & Technologies */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold mb-4">Skills & Technologies</h3>
                <div>
                  <Label className="mb-2 block">Programming Languages</Label>
                  <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
                    {programmingLanguages.map((lang) => (
                      <div key={lang} className="flex items-center space-x-2">
                        <Checkbox
                          id={`lang-${lang}`}
                          checked={formData.languages.includes(lang)}
                          onCheckedChange={() => handleArrayChange("languages", lang)}
                        />
                        <Label htmlFor={`lang-${lang}`} className="text-sm font-normal">
                          {lang}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="mb-2 block">Frameworks</Label>
                  <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
                    {[
                      "React",
                      "Vue",
                      "Angular",
                      "Node.js",
                      "Express",
                      "Django",
                      "Flask",
                      "Spring",
                      "Laravel",
                      "Rails",
                    ].map((framework) => (
                      <div key={framework} className="flex items-center space-x-2">
                        <Checkbox
                          id={`framework-${framework}`}
                          checked={formData.frameworks.includes(framework)}
                          onCheckedChange={() => handleArrayChange("frameworks", framework)}
                        />
                        <Label htmlFor={`framework-${framework}`} className="text-sm font-normal">
                          {framework}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="mb-2 block">Tools</Label>
                  <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
                    {[
                      "Git",
                      "Docker",
                      "Kubernetes",
                      "AWS",
                      "Azure",
                      "GCP",
                      "Jenkins",
                      "GitHub Actions",
                      "Terraform",
                      "Ansible",
                    ].map((tool) => (
                      <div key={tool} className="flex items-center space-x-2">
                        <Checkbox
                          id={`tool-${tool}`}
                          checked={formData.tools.includes(tool)}
                          onCheckedChange={() => handleArrayChange("tools", tool)}
                        />
                        <Label htmlFor={`tool-${tool}`} className="text-sm font-normal">
                          {tool}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="otherSkills">Other Skills</Label>
                  <Input
                    id="otherSkills"
                    type="text"
                    value={formData.otherSkills}
                    onChange={(e) => handleInputChange("otherSkills", e.target.value)}
                    placeholder="Enter other skills separated by commas..."
                  />
                </div>
              </div>
            )}

            {/* Step 3: Experience Matrix */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold mb-4">Experience Matrix</h3>
                <p className="mb-4 text-sm text-gray-600">
                  Rate your experience with the languages you selected:
                </p>
                <div className="space-y-4">
                  {formData.languages.length === 0 && (
                    <Alert variant="destructive">
                      <AlertTitle>No Languages Selected</AlertTitle>
                      <AlertDescription>
                        Please select programming languages in the previous step to rate your experience.
                      </AlertDescription>
                    </Alert>
                  )}
                  {formData.languages.map((language) => (
                    <div key={language} className="rounded-lg border p-4">
                      <h4 className="mb-3 text-base font-medium">{language}</h4>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor={`years.${language}`}>Years of Experience</Label>
                          <div className="relative">
                            <select
                              id={`years.${language}`}
                              className="block w-full rounded-md border border-neutral-200 dark:border-neutral-600 bg-neutral-300 dark:bg-neutral-700 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                              value={formData.experienceMatrix[language]?.years || ""}
                              onChange={(e) =>
                                handleExperienceChange(language, "years", e.target.value)
                              }
                            >
                              <option value="" disabled>
                                Select years
                              </option>
                              <option value="<1">Less than 1 year</option>
                              <option value="1-2">1-2 years</option>
                              <option value="3-5">3-5 years</option>
                              <option value="5+">5+ years</option>
                            </select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Self-Rating (1-5)</Label>
                          <div className="flex space-x-2">
                            {[1, 2, 3, 4, 5].map((rating) => (
                              <Button
                                key={rating}
                                type="button"
                                variant={
                                  (formData.experienceMatrix[language]?.rating || 0) >= rating
                                    ? "default"
                                    : "outline"
                                }
                                size="icon"
                                onClick={() => handleExperienceChange(language, "rating", rating)}
                                className={`h-8 w-8 rounded-full ${
                                  (formData.experienceMatrix[language]?.rating || 0) >= rating
                                    ? "bg-blue-500 text-white hover:bg-blue-600"
                                    : "border-gray-300 text-gray-500 hover:bg-gray-100"
                                }`}
                              >
                                {rating}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Files & Links */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold mb-4">Files & Links</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="resume">Resume (PDF, DOC, DOCX - Max 5MB)</Label>
                    <Input
                      id="resume"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => handleFileChange("resume", e.target.files?.[0] || null)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="samplePatches">Sample Patches (ZIP - Max 5MB)</Label>
                    <Input
                      id="samplePatches"
                      type="file"
                      accept=".zip"
                      onChange={(e) => handleFileChange("samplePatches", e.target.files?.[0] || null)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sshPublicKey">SSH Public Key</Label>
                  <Textarea
                    id="sshPublicKey"
                    value={formData.sshPublicKey}
                    onChange={(e) => handleInputChange("sshPublicKey", e.target.value)}
                    rows={3}
                    className="font-mono text-sm"
                    placeholder="ssh-rsa AAAAB3NzaC1yc2EAAAA..."
                  />
                  {formData.sshPublicKey && !validateSSHKey(formData.sshPublicKey) && (
                    <p className="text-sm text-red-500">Invalid SSH key format</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prLinks">Pull Request Links</Label>
                  <Textarea
                    id="prLinks"
                    value={formData.prLinks}
                    onChange={(e) => handleInputChange("prLinks", e.target.value)}
                    rows={3}
                    placeholder="List your relevant PR links, one per line..."
                  />
                </div>
              </div>
            )}

            {/* Step 5: Access & Preferences */}
            {currentStep === 5 && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold mb-4">Access & Preferences</h3>
                <div className="space-y-2">
                  <Label className="mb-2 block">Desired Access Level</Label>
                  <RadioGroup
                    value={formData.accessLevel}
                    onValueChange={(value) => handleInputChange("accessLevel", value)}
                    className="flex flex-wrap gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Read Only" id="access-read-only" />
                      <Label htmlFor="access-read-only">Read Only</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Contributor" id="access-contributor" />
                      <Label htmlFor="access-contributor">Contributor</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Maintainer" id="access-maintainer" />
                      <Label htmlFor="access-maintainer">Maintainer</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="ndaAgreement"
                      checked={formData.ndaAgreement}
                      onCheckedChange={(checked) => handleInputChange("ndaAgreement", checked)}
                    />
                    <Label htmlFor="ndaAgreement">I agree to sign an NDA if required</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="twoFactorEnabled"
                      checked={formData.twoFactorEnabled}
                      onCheckedChange={(checked) => handleInputChange("twoFactorEnabled", checked)}
                    />
                    <Label htmlFor="twoFactorEnabled">I have 2FA enabled on my GitHub account</Label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="earliestStartDate">Earliest Start Date</Label>
                  <Input
                    id="earliestStartDate"
                    type="date"
                    value={formData.earliestStartDate}
                    onChange={(e) => handleInputChange("earliestStartDate", e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Step 6: Legal & Signature */}
            {currentStep === 6 && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold mb-4">Legal & Signature</h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="codeOfConductAgreed"
                      checked={formData.codeOfConductAgreed}
                      onCheckedChange={(checked) =>
                        handleInputChange("codeOfConductAgreed", checked)
                      }
                      required
                    />
                    <Label htmlFor="codeOfConductAgreed">
                      I agree to abide by the project's Code of Conduct *
                    </Label>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="contributionGuidelinesAgreed"
                      checked={formData.contributionGuidelinesAgreed}
                      onCheckedChange={(checked) =>
                        handleInputChange("contributionGuidelinesAgreed", checked)
                      }
                      required
                    />
                    <Label htmlFor="contributionGuidelinesAgreed">
                      I have read and agree to the contribution guidelines *
                    </Label>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <h4 className="mb-3 font-medium">Digital Signature</h4>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name (for signature) *</Label>
                      <Input
                        id="fullName"
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => handleInputChange("fullName", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signatureDate">Date</Label>
                      <Input
                        id="signatureDate"
                        type="date"
                        value={formData.signatureDate}
                        onChange={(e) => handleInputChange("signatureDate", e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    By typing your full name above, you are providing your digital signature and legal
                    consent to this application.
                  </p>
                </div>
              </div>
            )}
          </form>
        </div>
        <div className="flex justify-between border-t p-6 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            Previous
          </Button>
          {currentStep < totalSteps ? (
            <Button type="button" onClick={nextStep}>
              Next
            </Button>
          ) : (
            <Button type="submit" onClick={handleSubmit}>
              Submit Application
            </Button>
          )}
        </div>
      </div>
    </div>
        
      

  )
}

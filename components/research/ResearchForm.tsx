"use client"

import React from "react"
import { useState, useEffect, useMemo } from "react"
import {
  Loader2,
  Upload,
  Save,
  Github,
  GitBranch,
  CheckCircle2,
  Trash2,
  AlertCircle,
  FileText,
  Users,
  Code2,
  Eye,
  Send,
  Menu,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

const buttonStyles = {
  base: "relative min-w-[120px] text-base leading-none whitespace-nowrap transition-all duration-200 active:scale-95",
  primary: "hover:shadow-lg hover:shadow-primary/30 focus:ring-2 focus:ring-primary/50",
  outline: "border-2 hover:bg-primary/5 focus:ring-2 focus:ring-primary/30",
  disabled: "opacity-50 cursor-not-allowed hover:shadow-none",
}

interface Author {
  name: string
  affiliation: string
  email: string
  isCorresponding: boolean
  orcid?: string
}

type SubmissionStep = "metadata" | "authors" | "content" | "preview" | "code" | "confirmation"

export default function ResearchForm() {
  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    abstract: "",
    doi: "",
    mainFile: null as File | null,
    supplementaryFiles: [] as File[],
  })
  const [authors, setAuthors] = useState<Author[]>([
    {
      name: "",
      affiliation: "",
      email: "",
      isCorresponding: true,
      orcid: "",
    },
  ])
  const [activeTab, setActiveTab] = useState<SubmissionStep>("metadata")
  const [isDraft, setIsDraft] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [keywords, setKeywords] = useState<string[]>([])
  const [currentKeyword, setCurrentKeyword] = useState("")
  const [hasCode, setHasCode] = useState(false)
  const [codeAvailability, setCodeAvailability] = useState<"public" | "private" | "none">("none")
  const [repoUrl, setRepoUrl] = useState("")
  const [progress, setProgress] = useState(0)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const steps = useMemo(
    () => [
      { id: "metadata" as const, title: "Paper Metadata", icon: <FileText className="w-4 h-4" />, progress: 20 },
      { id: "authors" as const, title: "Authors", icon: <Users className="w-4 h-4" />, progress: 40 },
      { id: "content" as const, title: "Content", icon: <FileText className="w-4 h-4" />, progress: 60 },
      { id: "code" as const, title: "Code", icon: <Code2 className="w-4 h-4" />, progress: 80 },
      { id: "preview" as const, title: "Preview", icon: <Eye className="w-4 h-4" />, progress: 100 },
      { id: "confirmation" as const, title: "Confirmation", icon: <CheckCircle2 className="w-4 h-4" />, progress: 100 },
    ],
    []
  )

  useEffect(() => {
    const currentStep = steps.find((step) => step.id === activeTab)
    setProgress(currentStep ? currentStep.progress : 0)
  }, [activeTab, steps])

  const handleAddAuthor = () => {
    setAuthors([
      ...authors,
      {
        name: "",
        affiliation: "",
        email: "",
        isCorresponding: false,
        orcid: "",
      },
    ])
  }

  const handleRemoveAuthor = (index: number) => {
    if (authors.length > 1) {
      const newAuthors = authors.filter((_, i) => i !== index)
      setAuthors(newAuthors)
    }
  }

  const handleAuthorChange = (
    index: number,
    field: keyof Author,
    value: string | boolean
  ) => {
    const newAuthors = [...authors]
    newAuthors[index] = { ...newAuthors[index], [field]: value }
    setAuthors(newAuthors)
  }

  const handleAddKeyword = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && currentKeyword.trim() && !keywords.includes(currentKeyword.trim())) {
      e.preventDefault()
      setKeywords([...keywords, currentKeyword.trim()])
      setCurrentKeyword("")
    }
  }

  const removeKeyword = (keywordToRemove: string) => {
    setKeywords(keywords.filter((keyword) => keyword !== keywordToRemove))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "main" | "supplementary") => {
    const files = e.target.files
    if (files) {
      if (type === "main") {
        setFormData({ ...formData, mainFile: files[0] })
      } else {
        setFormData({ ...formData, supplementaryFiles: Array.from(files) })
      }
    }
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault()
    }
    setIsSubmitting(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))
      setActiveTab("confirmation")
    } catch (error) {
      console.error('Submission failed:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getCurrentStepIndex = () => {
    return steps.findIndex((step) => step.id === activeTab)
  }

  const validateStep = () => {
    switch (activeTab) {
      case "metadata":
        return formData.title && formData.subject && keywords.length > 0
      case "authors":
        return authors.every((author) => author.name && author.email && author.affiliation)
      case "content":
        return formData.abstract && formData.mainFile
      case "code":
        return !hasCode || (hasCode && codeAvailability !== "none" && repoUrl)
      default:
        return true
    }
  }

  const renderStepContent = () => {
    switch (activeTab) {
      case "metadata":
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Enter the title of your research"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject Classification *</Label>
              <Select value={formData.subject} onValueChange={(value) => setFormData({ ...formData, subject: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select primary subject area" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cs">Computer Science</SelectItem>
                  <SelectItem value="physics">Physics</SelectItem>
                  <SelectItem value="math">Mathematics</SelectItem>
                  <SelectItem value="biology">Biology</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Keywords *</Label>
              <div className="space-y-2">
                <Input
                  placeholder="Type keyword and press Enter"
                  value={currentKeyword}
                  onChange={(e) => setCurrentKeyword(e.target.value)}
                  onKeyDown={handleAddKeyword}
                />
                <div className="flex flex-wrap gap-2">
                  {keywords.map((keyword) => (
                    <Badge
                      key={keyword}
                      variant="secondary"
                      className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => removeKeyword(keyword)}
                    >
                      {keyword}
                      <Trash2 className="w-3 h-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )
      case "authors":
        return (
          <div className="space-y-6">
            {authors.map((author, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg flex justify-between items-center">
                    Author {index + 1}
                    {authors.length > 1 && (
                      <Button variant="ghost" size="sm" onClick={() => handleRemoveAuthor(index)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label>Name *</Label>
                    <Input
                      value={author.name}
                      onChange={(e) => handleAuthorChange(index, "name", e.target.value)}
                      placeholder="Full name"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Affiliation *</Label>
                    <Input
                      value={author.affiliation}
                      onChange={(e) => handleAuthorChange(index, "affiliation", e.target.value)}
                      placeholder="Institution/Organization"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Email *</Label>
                    <Input
                      type="email"
                      value={author.email}
                      onChange={(e) => handleAuthorChange(index, "email", e.target.value)}
                      placeholder="Academic email"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id={`corresponding-${index}`}
                      checked={author.isCorresponding}
                      onCheckedChange={(checked) => handleAuthorChange(index, "isCorresponding", checked)}
                    />
                    <Label htmlFor={`corresponding-${index}`}>Corresponding Author</Label>
                  </div>
                  <div className="grid gap-2">
                    <Label>ORCID (optional)</Label>
                    <Input
                      value={author.orcid}
                      onChange={(e) => handleAuthorChange(index, "orcid", e.target.value)}
                      placeholder="XXXX-XXXX-XXXX-XXXX"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
            <Button type="button" variant="outline" onClick={handleAddAuthor}>
              Add Another Author
            </Button>
          </div>
        )
      case "content":
        return (
          <div className="space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="abstract">Abstract *</Label>
              <Textarea
                id="abstract"
                placeholder="Enter your research abstract"
                className="min-h-[200px]"
                value={formData.abstract}
                onChange={(e) => setFormData({ ...formData, abstract: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="mainFile">Upload Paper (PDF/LaTeX) *</Label>
              <div className="flex items-center space-x-2">
                <Input id="mainFile" type="file" accept=".pdf,.tex" onChange={(e) => handleFileChange(e, "main")} />
                <Button type="button" size="icon" variant="outline">
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="supplementary">Supplementary Materials</Label>
              <Input id="supplementary" type="file" multiple onChange={(e) => handleFileChange(e, "supplementary")} />
            </div>
          </div>
        )
      case "code":
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <Switch checked={hasCode} onCheckedChange={setHasCode} id="has-code" />
              <Label htmlFor="has-code">This research includes code</Label>
            </div>

            {hasCode && (
              <>
                <RadioGroup
                  value={codeAvailability}
                  onValueChange={(value: "public" | "private" | "none") => setCodeAvailability(value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="public" id="public" />
                    <Label htmlFor="public">Public Repository</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="private" id="private" />
                    <Label htmlFor="private">Private Repository (Reviewers Only)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="none" id="none" />
                    <Label htmlFor="none">No Code Repository</Label>
                  </div>
                </RadioGroup>

                {codeAvailability !== "none" && (
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="repo-url">Repository URL</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="repo-url"
                          placeholder="https://github.com/username/repo"
                          value={repoUrl}
                          onChange={(e) => setRepoUrl(e.target.value)}
                        />
                        <Button type="button" size="icon" variant="outline">
                          <Github className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label>Version/Release</Label>
                      <div className="flex space-x-2">
                        <Input placeholder="v1.0.0 or commit hash" />
                        <Button type="button" size="icon" variant="outline">
                          <GitBranch className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label>Dependencies</Label>
                      <Textarea placeholder="List major dependencies and versions" className="min-h-[100px]" />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )
      case "preview":
        return (
          <div className="space-y-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This is a preview of your submission. Please review all details carefully before submitting.
              </AlertDescription>
            </Alert>
            {/* Add preview content here */}
          </div>
        )
      case "confirmation":
        return (
          <div className="space-y-6 max-w-full overflow-x-hidden">
            <Alert className="bg-green-50 dark:bg-green-900/10">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <AlertDescription className="text-base">
                Your submission has been received successfully. Thank you for your contribution!
              </AlertDescription>
            </Alert>
            <div className="rounded-lg border p-4 space-y-4">
              <h3 className="font-medium">Submission Details</h3>
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Submission ID</span>
                  <span className="font-medium">#RS-{Date.now().toString().slice(-6)}</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Status</span>
                  <span className="text-green-500 font-medium">Submitted</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Date</span>
                  <span className="font-medium">{new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="container mx-auto py-12 px-6 max-w-5xl space-y-8">
      {/* Header Section with improved styling */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-gradient-to-r from-background to-muted p-6 rounded-lg shadow-sm">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Research Submission
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">Submit your research paper for peer review</p>
        </div>
        <div className="flex flex-col items-end gap-2 min-w-[200px]">
          <Progress value={progress} className="w-full h-2" />
          <span className="text-sm font-medium">{progress}% Complete</span>
        </div>
      </div>

      {/* Mobile Navigation Bar */}
      <div className="md:hidden sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex items-center gap-2 p-2 rounded-md hover:bg-muted"
          >
            <Menu className="w-5 h-5" />
            <span className="font-medium">{steps.find((step) => step.id === activeTab)?.title}</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Step {getCurrentStepIndex() + 1} of {steps.length}
            </span>
            <Progress value={progress} className="w-20 h-2" />
          </div>
        </div>
        
        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-background border-b shadow-lg">
            <nav className="p-2 space-y-1">
              {steps.map((step, index) => {
                const isActive = activeTab === step.id;
                const isCompleted = getCurrentStepIndex() > index;
                return (
                  <button
                    key={step.id}
                    onClick={() => {
                      setActiveTab(step.id);
                      setIsMobileMenuOpen(false);
                    }}
                    disabled={!isCompleted && index > getCurrentStepIndex()}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-md",
                      isActive && "bg-primary text-primary-foreground",
                      !isActive && isCompleted && "hover:bg-muted",
                      !isActive && !isCompleted && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {step.icon}
                    <span className="flex-1 text-left">{step.title}</span>
                    {isCompleted && <CheckCircle2 className="w-4 h-4" />}
                  </button>
                );
              })}
            </nav>
          </div>
        )}
      </div>

      {/* Status Alerts with animation */}
      {isDraft && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Alert className="border-2 border-primary/20 bg-primary/5">
            <AlertDescription className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Draft saved. Continue editing when ready.
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      <div className="grid md:grid-cols-6 gap-8">
        {/* Desktop Navigation Sidebar */}
        <Card className="md:col-span-1 md:sticky md:top-4 self-start hidden md:block border-0 shadow-lg bg-gradient-to-b from-background to-muted">
          <CardContent className="p-4">
            <nav className="space-y-3">
              {steps.map((step, index) => {
                const isActive = activeTab === step.id
                const isCompleted = getCurrentStepIndex() > index
                return (
                  <button
                    key={step.id}
                    onClick={() => setActiveTab(step.id)}
                    disabled={!isCompleted && index > getCurrentStepIndex()}
                    className={cn(
                      "w-full flex items-center gap-3 p-4 rounded-lg transition-all duration-200 relative",
                      isActive && "bg-primary text-primary-foreground shadow-md",
                      !isActive && isCompleted && "bg-muted text-muted-foreground hover:bg-muted-foreground/10",
                      !isActive && !isCompleted && "opacity-50 cursor-not-allowed",
                      "group"
                    )}
                  >
                    <div className={cn(
                      "flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium",
                      isActive && "bg-primary-foreground text-primary",
                      isCompleted && !isActive && "bg-primary/20 text-primary",
                      !isActive && !isCompleted && "bg-muted-foreground/20"
                    )}>
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <span className="text-sm font-medium flex-1 text-left">{step.title}</span>
                    {step.icon}
                    {isActive && (
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-l-full" />
                    )}
                  </button>
                )
              })}
            </nav>
          </CardContent>
        </Card>

        {/* Main content with improved styling */}
        <Card className="md:col-span-5 border-0 shadow-lg">
          <CardHeader className="border-b bg-muted/30 px-4 md:px-6">
            <CardTitle className="text-xl md:text-2xl flex items-center gap-3">
              {steps.find((step) => step.id === activeTab)?.icon}
              {steps.find((step) => step.id === activeTab)?.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStepContent()}
            </motion.div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row justify-between gap-4 border-t bg-muted/30 p-4 md:p-6">
            <Button
              variant="outline"
              onClick={() => setIsDraft(true)}
              disabled={activeTab === "confirmation"}
              className={cn(
                buttonStyles.base,
                buttonStyles.outline,
                "w-full sm:w-auto text-sm md:text-base",
                "scale-100 hover:scale-[1.02]",
                activeTab === "confirmation" && buttonStyles.disabled
              )}
            >
              <Save className="w-4 h-4 mr-2 shrink-0" />
              <span className="truncate">Save Draft</span>
            </Button>
            <div className="flex gap-3 w-full sm:w-auto">
              {getCurrentStepIndex() > 0 && activeTab !== "confirmation" && (
                <Button
                  variant="outline"
                  onClick={() => {
                    const prevIndex = getCurrentStepIndex() - 1;
                    setActiveTab(steps[prevIndex].id);
                  }}
                  className={cn(
                    buttonStyles.base,
                    buttonStyles.outline,
                    "flex-1 sm:flex-none text-sm md:text-base",
                    "scale-100 hover:scale-[1.02]"
                  )}
                >
                  Previous
                </Button>
              )}
              {activeTab !== "confirmation" && (
                <Button
                  onClick={async () => {
                    if (activeTab === "preview") {
                      await handleSubmit();
                    } else {
                      const nextIndex = getCurrentStepIndex() + 1;
                      if (nextIndex < steps.length) {
                        setActiveTab(steps[nextIndex].id);
                      }
                    }
                  }}
                  disabled={isSubmitting || !validateStep()}
                  className={cn(
                    buttonStyles.base,
                    buttonStyles.primary,
                    "flex-1 sm:flex-none text-sm md:text-base",
                    "scale-100 hover:scale-[1.02]",
                    (isSubmitting || !validateStep()) && buttonStyles.disabled
                  )}
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : activeTab === "preview" ? (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit Paper
                    </>
                  ) : (
                    "Next"
                  )}
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}


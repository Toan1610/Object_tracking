import { SupportForm } from "@/components/help/support-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { ExternalLink, BookOpen, MessageCircle } from "lucide-react"

export default function HelpPage() {
  const faqs = [
    {
      question: "What file formats are supported?",
      answer: "We support JPEG, PNG images and MP4 video files. Maximum file size is 100MB.",
    },
    {
      question: "Which AI models are available?",
      answer:
        "We offer YOLOv8 for object detection, SAM (Segment Anything Model) for segmentation, and Mask R-CNN for instance segmentation.",
    },
    {
      question: "How long does processing take?",
      answer:
        "Processing time varies based on file size and model complexity, typically ranging from 2-10 seconds for images and 30-60 seconds for videos.",
    },
    {
      question: "Can I download my results?",
      answer:
        "Yes, you can download your analysis results in JSON format, including detected objects, confidence scores, and bounding box coordinates.",
    },
    {
      question: "Is my data secure?",
      answer:
        "We take data security seriously. All uploads are processed securely and deleted after 30 days. We never share your data with third parties.",
    },
    {
      question: "How accurate are the AI models?",
      answer:
        "Our models achieve high accuracy rates: YOLOv8 (~85-90%), SAM (~90-95%), and Mask R-CNN (~80-85%) depending on the complexity of the image.",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Help & Support</h1>
        <p className="text-muted-foreground">Find answers to common questions or get in touch with our support team</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* FAQ Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5" />
                <span>Frequently Asked Questions</span>
              </CardTitle>
              <CardDescription>Quick answers to the most common questions</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger>{faq.question}</AccordionTrigger>
                    <AccordionContent>{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          {/* Contact Form */}
          <SupportForm />
        </div>

        <div className="space-y-6">
          {/* Quick Links */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Links</CardTitle>
              <CardDescription>Helpful resources and documentation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <BookOpen className="mr-2 h-4 w-4" />
                API Documentation
                <ExternalLink className="ml-auto h-4 w-4" />
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <MessageCircle className="mr-2 h-4 w-4" />
                Community Forum
                <ExternalLink className="ml-auto h-4 w-4" />
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <BookOpen className="mr-2 h-4 w-4" />
                Video Tutorials
                <ExternalLink className="ml-auto h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle>Need More Help?</CardTitle>
              <CardDescription>Our support team is here to help</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-medium">Email Support</p>
                <p className="text-sm text-muted-foreground">support@aivision.com</p>
                <p className="text-xs text-muted-foreground">Response within 24 hours</p>
              </div>
              <div>
                <p className="font-medium">Live Chat</p>
                <p className="text-sm text-muted-foreground">Available 9 AM - 6 PM EST</p>
                <Button size="sm" className="mt-2">
                  Start Chat
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

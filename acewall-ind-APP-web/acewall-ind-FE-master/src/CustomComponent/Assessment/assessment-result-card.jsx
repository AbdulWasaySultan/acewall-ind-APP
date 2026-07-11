"use client"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const AssessmentResultCard = ({ submission }) => {
  if (!submission) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>No submission data available</CardTitle>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="bg-green-50 dark:bg-green-900/20">
        <CardTitle className="text-center">Assessment Submitted Successfully!</CardTitle>
        <CardDescription className="text-center">Your assessment has been received</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {submission.totalScore !== undefined ? (
            <div className="text-center">
              <p className="text-2xl font-bold">Score: {submission.totalScore}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Submission Date: {new Date(submission.submittedAt).toLocaleString()}
              </p>
            </div>
          ) : (
            <p className="text-amber-600 text-center dark:text-amber-400 italic text-lg font-bold mt-4">
              Thank you for your submission. Your final score will be updated soon.
            </p>
          )}

          {submission && !submission.graded && (
            <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-md mt-4">
              <p className="text-amber-600 dark:text-amber-400 italic text-sm text-center">
                Some of your answers require manual grading. Your final score will be updated soon.
              </p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button onClick={() => (window.location.href = "/dashboard")} className="mt-4">
          Return to Dashboard
        </Button>
      </CardFooter>
    </Card>
  )
}

export default AssessmentResultCard

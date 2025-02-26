import Link from 'next/link'
import { Button } from '@/components/ui/button'

const VerificationErrorPage = async ({ searchParams }) => {
  // Mark the component as async since we're using searchParams
  const errorCode = searchParams?.error
  const errorMessage = searchParams?.message

  const getErrorMessage = (errorCode, specificMessage) => {
    const baseMessage = {
      'verification_failed': 'We could not verify your email. The link may have expired or is invalid.',
      'invalid_verification_link': 'The verification link is invalid or malformed.',
      'user_not_found': 'The user was not found in the database.',
      'unexpected': 'There was an unexpected error verifying your email.',
    }[errorCode] || 'There was an error verifying your email. Please try again.'

    return specificMessage ? `${baseMessage}\n\nError details: ${specificMessage}` : baseMessage
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <h1 className="text-2xl font-bold">Verification Failed</h1>
        <p className="text-gray-600 whitespace-pre-line">
          {getErrorMessage(errorCode, errorMessage)}
        </p>
        <div className="space-y-4">
          <Button asChild className="w-full">
            <Link href="/auth/sign-in">
              Sign In
            </Link>
          </Button>
          <p className="text-sm text-gray-500">
            Need a new verification link?{' '}
            <Link href="/auth/resend-verification" className="text-primary hover:underline">
              Click here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default VerificationErrorPage 
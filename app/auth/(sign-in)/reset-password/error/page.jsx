const PasswordResetErrorPage = ({ searchParams }) => {
  const error = searchParams.error

  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'expired':
        return 'This password reset link has expired. Please request a new one.'
      case 'invalid':
        return 'This password reset link is invalid.'
      default:
        return 'There was an error resetting your password. Please try again.'
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <h1 className="text-2xl font-bold">Password Reset Failed</h1>
        <p className="text-gray-600">
          {getErrorMessage(error)}
        </p>
        <div className="space-y-4">
          <Button asChild className="w-full">
            <Link href="/auth/forgot-password">
              Request New Reset Link
            </Link>
          </Button>
          <p className="text-sm text-gray-500">
            Remember your password?{' '}
            <Link href="/auth/sign-in" className="text-primary hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
} 
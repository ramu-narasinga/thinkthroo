import { Icons }  from '@/components/icons';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import {
  getAuthTypes,
  getViewTypes,
  getDefaultSignInView,
  getRedirectMethod
} from '@/utils/auth-helpers/settings';
import Card from '@/components/interfaces/auth-forms/card';
import { EmailSignIn } from '@/components/interfaces/auth-forms/email-signin';
import Separator from '@/components/interfaces/auth-forms/separator';
import OauthSignIn from '@/components/interfaces/auth-forms/oauth-signin';
import { ForgotPassword } from '@/components/interfaces/auth-forms/forgot-password';
import { UpdatePassword } from '@/components/interfaces/auth-forms/update-password';
import { SignUp } from '@/components/interfaces/auth-forms/sign-up';
import { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@thinkthroo/ui/components/button"
import { UserAuthForm } from "@/components/interfaces/auth-forms/user-auth-form"

export const metadata: Metadata = {
  title: "Authentication",
  description: "Authentication forms built using the components.",
}



export default async function SignIn({
  params,
  searchParams
}: {
  params: { id: string };
  searchParams: { disable_button: boolean };
}) {
  const { allowOauth, allowEmail, allowPassword } = getAuthTypes();
  const viewTypes = getViewTypes();
  const redirectMethod = getRedirectMethod();

  // Declare 'viewProp' and initialize with the default value
  let viewProp: string;

  // Assign url id to 'viewProp' if it's a valid string and ViewTypes includes it
  if (typeof params.id === 'string' && viewTypes.includes(params.id)) {
    viewProp = params.id;
  } else {
    const preferredSignInView =
      cookies().get('preferredSignInView')?.value || null;
    viewProp = getDefaultSignInView(preferredSignInView);
    return redirect(`/signin/${viewProp}`);
  }

  // Check if the user is already logged in and redirect to the dashboard page if so
  const supabase = createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (user && viewProp !== 'update_password') {
    return redirect('/');
  } else if (!user && viewProp === 'update_password') {
    return redirect('/signin');
  }

  return (
    // <div className="flex justify-center height-screen-helper">
    //   <div className="flex flex-col justify-between max-w-lg p-3 m-auto w-80 ">
    //     <div className="flex justify-center pb-12 ">
    //       <Icons.logo width="64px" height="64px" />
    //     </div>
    //     <Card
    //       title={
    //         viewProp === 'forgot_password'
    //           ? 'Reset Password'
    //           : viewProp === 'update_password'
    //             ? 'Update Password'
    //             : viewProp === 'signup'
    //               ? 'Sign Up'
    //               : 'Sign In'
    //       }
    //     >
          // {viewProp === 'password_signin' && (
          //   <PasswordSignIn
          //     allowEmail={allowEmail}
          //     redirectMethod={redirectMethod}
          //   />
          // )}
          // {viewProp === 'email_signin' && (
          //   <EmailSignIn
          //     allowPassword={allowPassword}
          //     redirectMethod={redirectMethod}
          //     disableButton={searchParams.disable_button}
          //   />
          // )}
          // {viewProp === 'forgot_password' && (
          //   <ForgotPassword
          //     allowEmail={allowEmail}
          //     redirectMethod={redirectMethod}
          //     disableButton={searchParams.disable_button}
          //   />
          // )}
          // {viewProp === 'update_password' && (
          //   <UpdatePassword redirectMethod={redirectMethod} />
          // )}
          // {viewProp === 'signup' && (
          //   <SignUp allowEmail={allowEmail} redirectMethod={redirectMethod} />
          // )}
          // {viewProp !== 'update_password' &&
          //   viewProp !== 'signup' &&
          //   allowOauth && (
          //     <>
          //       <Separator text="Third-party sign-in" />
          //       <OauthSignIn />
          //     </>
          //   )}
    //     </Card>
    //   </div>
    // </div>
    <>
      <div className="md:hidden">
        <Image
          src="/examples/authentication-light.png"
          width={1280}
          height={843}
          alt="Authentication"
          className="block dark:hidden"
        />
        <Image
          src="/examples/authentication-dark.png"
          width={1280}
          height={843}
          alt="Authentication"
          className="hidden dark:block"
        />
      </div>
      <div className="container relative hidden h-[800px] flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
          <div className="absolute inset-0 bg-zinc-900" />
          <div className="relative z-20 flex items-center text-lg font-medium">
            <Icons.logo className='mr-2 h-8 w-8' />
            Think Throo
          </div>
          <div className="relative z-20 mt-auto">
            <blockquote className="space-y-2">
              <p className="text-lg">
                &ldquo;This content is really good please keep it up.&rdquo;
              </p>
              <footer className="text-sm">@panchcw</footer>
            </blockquote>
          </div>
        </div>
        <div className="lg:p-8">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            {
              viewProp === 'password_signin' && (
                <UserAuthForm 
                  allowEmail={allowEmail}
                  redirectMethod={redirectMethod}
                />
              )
            }
            
            {
              viewProp === 'signup' && (
                <SignUp allowEmail={allowEmail} redirectMethod={redirectMethod} />
              )
            }

            {
              viewProp === 'email_signin' && (
                <EmailSignIn
                  allowPassword={allowPassword}
                  redirectMethod={redirectMethod}
                  disableButton={searchParams.disable_button}
                />
              )
            }

          {viewProp === 'forgot_password' && (
            <ForgotPassword
              allowEmail={allowEmail}
              redirectMethod={redirectMethod}
              disableButton={searchParams.disable_button}
            />
          )}

          {viewProp === 'update_password' && (
            <UpdatePassword redirectMethod={redirectMethod} />
          )}

          {viewProp !== 'update_password' &&
            viewProp !== 'signup' &&
            allowOauth && (
              // <>
              //   <Separator text="Third-party sign-in" />
              //   <OauthSignIn />
              // </>
              <>
              <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>
            <OauthSignIn />
            </>
          )}

            {/* <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>
            <Button variant="outline" type="button" disabled={isLoading}>
              {isLoading ? (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Icons.gitHub className="mr-2 h-4 w-4" />
              )}{" "}
              GitHub
            </Button> */}

            <p className="px-8 text-center text-sm text-muted-foreground">
              By clicking continue, you agree to our{" "}
              <Link
                href="/terms"
                className="underline underline-offset-4 hover:text-primary"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="underline underline-offset-4 hover:text-primary"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
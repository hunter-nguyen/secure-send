"use client";

import { Auth, Typography, Button } from '@supabase/ui'
import { createClient } from '@supabase/supabase-js'
import { supabase } from "@/lib/supabase"

const Container = (props) => {
  const { user } = Auth.useUser()
  if (user)
    return (
      <>
        <Typography.Text>Signed in: {user.email}</Typography.Text>
        <Button block onClick={() => props.supabaseClient.auth.signOut()}>
          Sign out
        </Button>
      </>
    )
  return props.children
}

export default function AuthBasic() {
  return (
    <Auth.UserContextProvider supabaseClient={supabase}>
      <Container supabaseClient={supabase}>
        <Auth onlyThirdPartyProviders={true} supabaseClient={supabase} providers={['google']} />
      </Container>
    </Auth.UserContextProvider>
  )
}
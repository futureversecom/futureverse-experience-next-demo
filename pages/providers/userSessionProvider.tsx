import * as sdk from '@futureverse/experience-sdk'
import * as React from 'react'

type UserSession = sdk.User // for demo only

interface UserSessionContextProps {
  userSession: UserSession | null
  setUserSession: React.Dispatch<React.SetStateAction<UserSession | null>>
}

export const UserSessionContext = React.createContext<
  UserSessionContextProps | undefined
>(undefined)

interface UserSessionProviderProps {
  children: React.ReactNode
}

const UserSessionProvider: React.FC<UserSessionProviderProps> = ({
  children,
}) => {
  const [userSession, setUserSession] = React.useState<UserSession | null>(null)

  return (
    <UserSessionContext.Provider value={{ userSession, setUserSession }}>
      {children}
    </UserSessionContext.Provider>
  )
}

export default UserSessionProvider

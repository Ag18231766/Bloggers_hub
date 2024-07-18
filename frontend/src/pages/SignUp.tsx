import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SignUpUserSchemaType } from "@amartya_gupta/medium_type";


export function SignUp(){
    const [username,setUsername] = useState<string>("");
    const [email,setEmail] = useState<string>("");
    const [password,setPassword] = useState<string>("");
    const [message,SetMessage] = useState<string>("");
    const navigation = useNavigate();

    async function SignUpCall(){
        try {
            const response = await axios.post<SignUpUserSchemaType | {message:string}>(
              'https://mediumclone-production.up.railway.app/api/v1/users/signup',
              {
                email: email,
                password: password,
                username: username
              }
            );
        
            if ('message' in response.data) {
              SetMessage(() => (response.data as {message:string}).message);
            }else{
                navigation("/Dashboard");
            }
        } catch (error) {
            console.error('Request error:', error);
        }
    }
    
    return (
        <div>
            <input type="text" placeholder="username" onChange={(e) => setUsername(() => e.target.value)}></input>
            <input type="text" placeholder="email" onChange={(e) => setEmail(() => e.target.value)}></input>
            <input type="text" placeholder="password" onChange={(e) => setPassword(() => e.target.value)}></input>
            <button onClick={SignUpCall}>SignUp</button>
            {message.length !== 0 ? <div>{message}</div>:<div></div>}
        </div>
    )
}


// function AppBarSignUp(){
//     const navigation = useNavigate();
  
//     function GoToDashboard(){
//       navigation('/Dashboard');
//     }
    
  
//     return (
//       <div>
//         <button onClick={GoToDashboard}>Dashboard</button>
   
//       </div>
//     )
//   }
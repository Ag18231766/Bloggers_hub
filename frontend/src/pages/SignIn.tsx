import { useNavigate } from "react-router-dom";

export function SignIn(){


    return(
        <div>
            <AppBarSignIn></AppBarSignIn>
            <div>SignIN</div>
        </div>
    )
}

function AppBarSignIn(){
    const navigation = useNavigate();
    function GoToDashboard(){
      navigation('/Dashboard');
    }
    function GoToSignIn(){
      navigation('/SignUp')
    }
    return (
      <div>
        <button onClick={GoToDashboard}>Dashboard</button>
        <button onClick={GoToSignIn}>SignUp</button>
      </div>
  
    )
  }
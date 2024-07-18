import { useNavigate } from "react-router-dom";

export function Landing(){
    return (
        <div>
            <AppBarLanding></AppBarLanding>
            Landing
        </div>
    )
}
function AppBarLanding(){
    const navigation = useNavigate();
  
    function GoToSpecificPosts(){
      navigation('/PostsView');
    }
    function GoToSignIn(){
      navigation('/SignIn');
    }
    return(
      <div>
        <button onClick={GoToSpecificPosts}>PostsView</button>
        <button onClick={GoToSignIn}>SignIn</button>
      </div>
    )
  }
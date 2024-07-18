import { useNavigate } from "react-router-dom";

export function Dashboard(){
    return (
        <div>
            <AppBarDashboard></AppBarDashboard>
            Dashboard
        </div>
    )
}
function AppBarDashboard(){
    const navigation = useNavigate();
    function GoToSpecificPosts(){
      navigation('/PostsView');
    }
    function GoToPostCreation(){
      navigation('/PostCreation');
    }
    return(
      <div>
        <button onClick={GoToSpecificPosts}>SpecificPosts</button>
        <button onClick={GoToPostCreation}>PostCreation</button>
      </div>
    )
  }
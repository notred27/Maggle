import ProfileBadgeUI from "./ProfileBadgeUI";
import SettingBadgeUI from "./SettingBadgeUI";
import ThemeOption from "./ThemeOption";

export default function AppHeader({ profile, logOut, nav }) {




    return (
        <header className='appHeader'>
            {/* <span className='streakText'>
                  Current Streak: {gameState.score}
                  <br />
                  Best Streak: {gameState.bestScore}
                </span> */}

            {/* <SettingBadgeUI></SettingBadgeUI> */}


            <h1 className='noselect' style={{ marginLeft: "10px" }}>Maggle!</h1>

            <br />

            <ProfileBadgeUI profile={profile}>

                <button onClick={() => logOut()}>Log out</button>

                <hr />

                {profile !== null && profile.id === "MaggleGuest" && <button onClick={() => nav("/guest")}>Switch Target Account</button>}

                <button onClick={() => { navigator.clipboard.writeText(window.location.href) }}>Share Your Maggle</button>

                <hr />

                <div className='theme-options'>
                    <ThemeOption theme={"heardle"} />
                    <ThemeOption theme={"red"} />
                    <ThemeOption theme={"purple"} />
                    <ThemeOption theme={"blue"} />
                    <ThemeOption theme={"green"} />

                </div>

                <hr />

            </ProfileBadgeUI>


        </header>

    );
}
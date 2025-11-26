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


            <h1 className='noselect'>Maggle!</h1>


            <ProfileBadgeUI profile={profile}>

                <h4>Account</h4>

                {profile !== null && profile.id === "MaggleGuest" && <button onClick={() => nav("/guest")}>Switch Target Account</button>}

                <button onClick={() => logOut()}>Log out</button>

                <h4>Theme</h4>
                <div className='theme-options'>
                    <ThemeOption theme={"heardle"} />
                    <ThemeOption theme={"red"} />
                    <ThemeOption theme={"purple"} />
                    <ThemeOption theme={"blue"} />
                    <ThemeOption theme={"green"} />

                </div>

                {/* <h4>Share your playlists!</h4> */}

                <br />

                <button onClick={() => { navigator.clipboard.writeText(window.location.href) }}>Share Your Playlists!</button>


            </ProfileBadgeUI>


        </header>

    );
}
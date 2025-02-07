export default function ThemeOption({theme}) {

    const setTheme = () => {
        document.querySelector('body').setAttribute('data-theme', theme);
        window.localStorage.setItem('theme', theme);
    }

    return (
        <div onClick={setTheme} className = 'theme-option' id = {`theme-${theme}`} ></div>
    )
}
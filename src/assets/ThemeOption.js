export default function ThemeOption({theme}) {

    /**
     * Change the website's theme colors (via css variables)
     */
    const setTheme = () => {
        document.querySelector('body').setAttribute('data-theme', theme);
        window.localStorage.setItem('theme', theme);
    }

    return (
        <div onClick={setTheme} className = 'theme-option' id = {`theme-${theme}`} ></div>
    )
}
import { Scripts } from "@mauroandre/velojs";
import { darkTheme, lightTheme } from "./styles/theme.css.js";

const themeScript = `
(function() {
    var t = localStorage.getItem('theme');
    if (!t) t = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    document.documentElement.className = t === 'light' ? '${lightTheme}' : '${darkTheme}';
})();
`;

interface RootProps {
    children: preact.ComponentChildren;
}

export const Component = ({ children }: RootProps) => {
    return (
        <html lang="en" class={darkTheme}>
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>my-ha</title>
                <script dangerouslySetInnerHTML={{ __html: themeScript }} />
                <Scripts />
            </head>
            <body>{children}</body>
        </html>
    );
};

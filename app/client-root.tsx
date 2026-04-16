import { Scripts } from "@mauroandre/velojs";

interface RootProps {
    children: preact.ComponentChildren;
}

export const Component = ({ children }: RootProps) => {
    return (
        <html lang="pt-BR">
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>my-ha</title>
                <Scripts />
            </head>
            <body>{children}</body>
        </html>
    );
};

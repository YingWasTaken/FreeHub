import type { JSX } from "react";
import { useRef } from "react";
import { createPortal } from "react-dom";
import "./InfoButton.scss";

export default function InfoButton(): JSX.Element {
    const dialog = useRef<HTMLDialogElement>(null);

    return (
        <>
            <button type="button" onClick={() => dialog.current?.showModal()}>
                About
            </button>

            {createPortal(
                <dialog ref={dialog} className="info-dialog">
                    <h2>About FreeHub</h2>
                    <p>
                        We, the FreeHub developers, are poor as fucking rats. We
                        understand that other developers need free resources
                        too, so we put them all together in one place where
                        they're easy to get to.
                    </p>

                    <a
                        className="discord-button"
                        href="https://discord.gg/V2CShbdJP3"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <i className="fa-brands fa-discord"></i> Join our
                        Discord
                    </a>

                    <button
                        type="button"
                        className="close-button"
                        onClick={() => dialog.current?.close()}
                    >
                        Close
                    </button>
                </dialog>,
                document.body
            )}
        </>
    );
}

import type { JSX, MouseEvent } from "react";
import { useState } from "react";
import "./InfoButton.scss";

export default function InfoButton(): JSX.Element {
    const [open, setOpen] = useState<boolean>(false);

    const handleToggle = (): void => setOpen((prev) => !prev);
    const handleClose = (): void => setOpen(false);
    const stopPropagation = (e: MouseEvent<HTMLDivElement>): void =>
        e.stopPropagation();

    return (
        <>
            {/* Floating Info Button */}
            <button
                className="info-button"
                onClick={handleToggle}
                aria-label="About FreeHub"
            >
                <i className="fa-solid fa-circle-info"></i>
            </button>

            {/* Modal */}
            {open && (
                <div className="info-modal" onClick={handleClose}>
                    <div className="info-content" onClick={stopPropagation}>
                        <h2>About FreeHub</h2>
                        <p>
                            <strong>FreeHub</strong> is a non-profit personal
                            project created with the goal of bringing together
                            in one place all the free and open assets that
                            designers, developers, and content creators might
                            need — from icons and fonts to APIs and 3D models.
                        </p>
                        <p>
                            This website is also part of a learning journey: I’m
                            a student building <strong>FreeHub</strong> to learn
                            and improve my skills in <strong>React</strong>,
                            design systems, and front-end development while
                            contributing something useful to the community.
                        </p>
                        <p>
                            For suggestions, improvements, or to share new
                            resources, join our community on Discord:
                        </p>
                        <a
                            href="https://discord.gg/V2CShbdJP3"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="discord-link"
                        >
                            <i className="fa-brands fa-discord"></i> Join our
                            Discord
                        </a>
                        <button className="close-btn" onClick={handleClose}>
                            Close
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

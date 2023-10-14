import getConfig from 'next/config';

const Footer = () => {

    const { publicRuntimeConfig } = getConfig();
    return (
        <footer className="footer items-center p-2 text-neutral-content">
            <div className="items-center grid-flow-col">
                <p>&copy; 2023 &mdash; ShorkBytes</p>
            </div>
            <div className="grid-flow-col gap-4 md:place-self-center md:justify-self-end">
                Version {publicRuntimeConfig.appVersion}
            </div>
        </footer>
    )
};

export default Footer;
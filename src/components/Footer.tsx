import getConfig from 'next/config';

const Footer = () => {

    const { publicRuntimeConfig } = getConfig();
    return (
        <footer className="flex justify-between items-center p-2 text-neutral-content">
            <div className="justify-self-start">
                <p>&copy; 2023 &mdash; ShorkBytes</p>
            </div>
            <div className="justify-self-end">
                Version {publicRuntimeConfig.appVersion}
            </div>
        </footer>
    )
};

export default Footer;
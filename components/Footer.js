import React from 'react';

const Footer = () => {
    return (
        <div
            style={{
                background: 'var(--color-bg-2)',
                backgroundImage: `url("/images/BackgroundHeader.png")`,
                width: '100%',
                position: 'sticky',
                bottom: 0,
                boxShadow: '10px 1px 1px rgba(0, 0, 0, 0.1)',
                zIndex: 2,
                fontSize: 14,
                color: '#FFFFFF',
                textAlign: 'center',
            }}
        >
            <p>
                <br></br>{' '}
            </p>
            <p>
                Copyright © 2023 PIYAPHIPHAT KHAMMAW <br></br>FACULTY OF INFORMATION TECHNOLOGY AND
                DIGITAL INNOVATION | KMUTNB
                <br></br>{' '}
            </p>
        </div>
    );
};

export default Footer;

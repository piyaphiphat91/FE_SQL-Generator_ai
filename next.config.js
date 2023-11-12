// /** @type {import('next').NextConfig} */
// const withSvgr = require('next-plugin-svgr');

// const nextConfig = withSvgr({
//     reactStrictMode: false,
//     poweredByHeader: false,
//     env: {
//       GOOGLE_CLIENT_ID:
//             '557470393805-9is1frgocambcjtmnsge2at28gloqa1j.apps.googleusercontent.com',
//         GOOGLE_CLIENT_SECRET: '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',
//         publicRuntimeConfig: {
//           // เพิ่มค่า domain ของเว็บไซต์ที่คุณต้องการให้เป็น http://iplus-digital.com:3000/
//           SITE_URL: 'http://iplus-digital.com:3000/',
//       },
//       //  GOOGLE_CLIENT_ID:
//       //  '691799191646-1ldb8351nprap1lou46o4s3bhfe3amsa.apps.googleusercontent.com',
//       //  GOOGLE_CLIENT_SECRET: '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',

//        //GOOGLE_CLIENT_ID:
//        // '557470393805-mj7flg1ivpaftvj42jaq2fotsdh9tm1l.apps.googleusercontent.com',
//        // GOOGLE_CLIENT_SECRET: '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',
//     },
// });

// module.exports = nextConfig;
/** @type {import('next').NextConfig} */
const withSvgr = require('next-plugin-svgr');

const nextConfig = withSvgr({
    reactStrictMode: false,
    poweredByHeader: false,
    env: {
        GOOGLE_CLIENT_ID:
            '557470393805-rie52u8cju33sjc2d6oshjd5tua7te77.apps.googleusercontent.com',
        GOOGLE_CLIENT_SECRET: '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',
        redirect_uri : 'http://iplus-digital.com:3000'
    },
    publicRuntimeConfig: {
        SITE_URL: 'http://iplus-digital.com:3000/',
    },
});

module.exports = nextConfig;

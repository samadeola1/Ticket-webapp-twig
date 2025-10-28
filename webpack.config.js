// webpack.config.js
const Encore = require("@symfony/webpack-encore");

if (!Encore.isRuntimeEnvironmentConfigured()) {
    Encore.configureRuntimeEnvironment(process.env.NODE_ENV || "dev");
}

Encore.setOutputPath("public/build/") // Where built files will go
    .setPublicPath("/build") // Public path used by Twig functions

    // ENTRY POINT: Tells Encore to read app.js (which imports app.css)
    .addEntry("app", "./assets/app.js")

    .splitEntryChunks()
    .enableSingleRuntimeChunk()

    .cleanupOutputBeforeBuild()
    .enableBuildNotifications()
    .enableSourceMaps(!Encore.isProduction())
    .enableVersioning(Encore.isProduction())

    .configureBabelPresetEnv((config) => {
        config.useBuiltIns = "usage";
        config.corejs = "3.23"; // Or a version compatible with your core-js install
    })

    // ===> ADD THIS LINE TO ENABLE POSTCSS <===
    .enablePostCssLoader();

// uncomment if you use Sass/SCSS files
//.enableSassLoader()

// uncomment if you use Less files
//.enableLessLoader()

// uncomment if you want to copy static assets
//.copyFiles({
//    from: './assets/images',
//    to: 'images/[path][name].[ext]'
//})

module.exports = Encore.getWebpackConfig();

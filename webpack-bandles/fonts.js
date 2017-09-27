module.exports = () => {
    return {
        module: {
            rules: [
                {
                    test: /\.(eot|ttf|woff|woff2)$/,
                    loader: 'file-loader?name=./fonts/[name]/[name].[ext]'
                }
            ]
        }
    };
};
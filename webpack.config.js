const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin');
const WebpackCleanPlugin = require('clean-webpack-plugin');
const ImageminPlugin = require('imagemin-webpack-plugin').default;
const glob = require('glob');
const imageminMozjpeg = require('imagemin-mozjpeg');
const webpack = require('webpack');
const OfflinePlugin = require('offline-plugin');
const PRODUCTION = process.env.NODE_ENV === 'production';

var rules = [
			{
				test: /\.js$/,
				use: [
					{
						loader: 'babel-loader',
						options: {
							presets: ['es2015']
						}
					}
				]
			},
			{
				test: /\.(jpg|png)$/,
				use: [ 
					{loader: 'responsive-loader',
					options:{
						quality: 80,
						sizes: [400],
						name: 'imgs/[name]-[width].[ext]' }	}
				]
			},
			   { test: /\.(gif|jpeg)$/i,
  				use: [
  			    	'file-loader',
	  			    {
		     		loader: 'image-webpack-loader',
  			  	  	options: {
  			  	  	outputPath: '[path]/[name].[ext]',
  			      	bypassOnDebug: true,
  			    	}
   				 	}
   				]}
   			];

			if( PRODUCTION )
 			{ 
			    rules.push(	{
				test: /\.css$/,
				use: [MiniCssExtractPlugin.loader,
				"css-loader"]
			},
			{
				test: /\.scss$/,
				use:[ MiniCssExtractPlugin.loader,
				"css-loader",
				"postcss-loader",
				"sass-loader" ]
			})}
			    else{ 
			  	    rules.push(	{
				test: /\.css$/,
				use: ['style-loader',
				"css-loader"]
			},
			{
				test: /\.scss$/,
				use:[ 'style-loader',
				"css-loader",
				"postcss-loader",
				"sass-loader" ]
			})
}

var plugins = [
	/*new ImageminPlugin({
		 externalImages: {
         context: '.src/imgs', // Important! This tells the plugin where to "base" the paths at
      },
      plugins: [
      		imageminMozjpeg({
      		progressive: true,
      		quality: 10
      	})
      ]
              }),*/
    new MiniCssExtractPlugin({
      inject: false, 
      filename: "[name].css",
      chunkFilename: "[id].css"
    }),
    new HtmlWebpackPlugin({
    		template: './src/index.html',
    		inject: true,
			chunks: ['index'],
			filename: 'index.html'
		}),
    new HtmlWebpackPlugin({
    		template: './src/restaurant.html',
    		inject: true,
			chunks: ['sub'],
			filename: 'restaurant.html'
		}),
    new CopyWebpackPlugin([{
    	from: './sw_for_production/sw.js', 
    	to: './' 
    },{
    	from: './src/data', 
    	to: './data' 
    },
   	{
   		from: './src/images',
   		to: './images'
   	}
    ]),
    new WebpackCleanPlugin(['dist'])	
];

module.exports = {
	entry: { index: './src/main.js',
			  sub: './src/sub.js'},
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: '[name].js',
	},
	plugins: plugins,
	module: {
		rules: rules
			}
			/*{
				test: /\.html$/,
				use: [{
					loader: 'file-loader',
					options: {
						name: '[name].[ext]' 
					}
				}],
				//exclude: path.resolve(__dirname, 'src/index.html')
			}*/
}
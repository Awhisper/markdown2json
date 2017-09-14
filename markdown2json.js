/**
 * @project: markdown2json
 * @file: markdown2json.js
 * @author: Awhisper
 */

var fs = require('fs');
var md = require('markdown').markdown;

var text = fs.readFileSync('./test.md', 'utf-8');
var json = convertMD2Json(text);
console.log(json);

// var fileDirectory = './article';
// fs.readdir(fileDirectory, function (err, files) {
//     if (err) {
//         console.log(err);
//         return;
//     }

//     var articles = {};
//     files.forEach(function (filename) {
//         if (filename.indexOf('.md') > 0) {
//             articles[filename] = fs.readFileSync('./article/' + filename, 'utf-8');
//         }

//     });
//     console.log(articles);

//     for (var key in articles) {
//         if (articles.hasOwnProperty(key)) {
//             var text = articles[key];
//             var json = convertMD2Json(text);
//             console.log(text);
//         }

//     }
// });

function convertMD2Json(mdtext) {
    var tree = md.parse(mdtext);

    var resultJson = {};
    resultJson.t = 'div';
    resultJson.style = [];
    resultJson.blockNum = 1;
    resultJson.c = [];

    for (var index = 0; index < tree.length; index++) {
        var mdnode = tree[index];
        
    }

    console.log(tree);
    return '22';
}

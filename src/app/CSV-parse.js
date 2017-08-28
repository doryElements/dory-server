const parse = require('csv-parse');
const inputPath = './Cartographie_DITW_Applications_DITW.csv';
const fs = require('fs');
const fetch = require('node-fetch');
let output = [];
let apps = [];


fetch('http://localhost:9200/sam/sam/',{
    method : 'DELETE'
}).catch(function(err){console.error(err)});


const parser = parse({delimiter: ';'}, function(err, data){
    output.push(data);
}).on('end',function(){
    for(let i=1;i<output[0].length;i++){
        let app={};
        for(let j=0;j<output[0][0].length;j++){
            app[output[0][0][j]]=output[0][i][j];
        }
        apps.push(app);
    }
    let mergedApps = mergeEnvs(apps);

    mergedApps.forEach(function(app){
        "use strict";
        fetch('http://localhost:9200/sam/sam',{
            headers:{
                'Content-Type' : 'application/json'
            },
            method: 'POST',
            body : JSON.stringify(app)
        })
            .then(function(res){return res.json();})
            .then(function(res){console.log(res)});
    });
});

fs.createReadStream(inputPath).pipe(parser);

function mergeEnvs(list){
    let mergedApps = [];

    list.forEach(function(element){
        let newApp = {};
        let serversDmz = [];
        let serversLan = [];
        let urls = [];
        let bdds = [];
        let vips = [];
        let softwares = [];

        if(element['Serveur Web LAN']){
            serversLan = [...serversLan,...element['Serveur Web LAN'].split(/[\n,]+/)];
            serversLan = serversLan.map(function(element){
               return element.trim();
            });
            serversLan = serversLan.filter(s=>s!='');
        }
        if(element['Serveur Web DMZ']){
            serversDmz = [...serversDmz,...element['Serveur Web DMZ'].split(/[\n,]+/)];
            serversDmz = serversDmz.map(function(element){
                return element.trim();
            });
            serversDmz = serversDmz.filter(s=>s!='');
        }

        if(element['URL']){
            urls = [...urls,...element['URL'].split(/[\n,]+/)];
            urls = urls.map(function(element){
                return element.trim();
            });
            urls = urls.filter(s=>s!='');
        }

        if(element['VIP']){
            vips = [...vips,...element['VIP'].split(/[\n,\/]+/)];
            vips = vips.map(function(element){
                return element.trim();
            });
            vips = vips.filter(s=>s!='');
        }

        if(element['Serveur DB']){
            bdds = [...bdds,...element['Serveur DB'].split(/[\n,\/]+/)];
            bdds = bdds.map(function(element){
                return element.trim();
            });
            bdds = bdds.filter(s=>s!='');
        }

        if(element['Version DB']){
            softwares.push(element['Version DB']);
        }
        if(element['Version Apache']){
            softwares.push(element['Version Apache']);
        }
        if(element['Version Language']){
            softwares.push(element['Version Language']);
        }
        if(element['Framework']){
            softwares.push(element['Framework']);
        }
        if(element['OS serveur']){
            softwares.push(element['OS serveur']);
        }

        if(mergedApps.length > 0 && mergedApps[mergedApps.length-1].app === element.Application){
            let newEnv = {};

            newEnv['softwares']=softwares;
            newEnv['urls']=urls;
            newEnv['bdds']=bdds;
            newEnv['vips']=vips;
            newEnv['serveursDmz']=serversDmz;
            newEnv['serveursLan']=serversLan;

            mergedApps[mergedApps.length-1][element.Env.toLowerCase()] = newEnv;
        }
        else{
            newApp.app = element.Application;
            newApp.tags = [];
            newApp[element.Env.toLowerCase()] = {};
            newApp[element.Env.toLowerCase()]['softwares'] = softwares;
            newApp[element.Env.toLowerCase()]['urls'] = urls;
            newApp[element.Env.toLowerCase()]['bdds'] = bdds;
            newApp[element.Env.toLowerCase()]['vips'] = vips;
            newApp[element.Env.toLowerCase()]['serveursDmz'] = serversDmz;
            newApp[element.Env.toLowerCase()]['serveursLan'] = serversLan;
            mergedApps.push(newApp);
        }
    });
    return mergedApps;
}
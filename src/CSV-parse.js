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
        let servers = [];
        let urls = [];
        let bdds = [];
        let vips = [];
        let softwares = [];

        if(element['Serveur Web LAN']){
            element['Serveur Web LAN'].split(/[\n,\/]+/).forEach(function(e){
                "use strict";
               servers.push('LAN -'+e);
            });
        }
        if(element['Serveur Web DMZ']){
            element['Serveur Web DMZ'].split(/[\n,\/]+/).forEach(function(e){
                "use strict";
                servers.push('DMZ -'+e);
            });
        }

        if(element['URL']){
            urls = [...urls,...element['URL'].split(/[\n,]+/)];
        }

        if(element['VIP']){
            vips = [...vips,...element['VIP'].split(/[\n,\/]+/)];
        }

        if(element['Serveur DB']){
            bdds = [...bdds,...element['Serveur DB'].split(/[\n,\/]+/)];
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
            newEnv['serveurs']=servers;

            mergedApps[mergedApps.length-1][element.Env] = newEnv;
        }
        else{
            newApp.app = element.Application;
            newApp[element.Env] = {};
            newApp[element.Env]['softwares'] = softwares;
            newApp[element.Env]['urls'] = urls;
            newApp[element.Env]['bdds'] = bdds;
            newApp[element.Env]['vips'] = vips;
            newApp[element.Env]['serveurs'] = servers;
            mergedApps.push(newApp);
        }
    });
    return mergedApps;
}
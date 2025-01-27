const express = require('express')
const app = express()
const cors = require("cors");
const ytdl=require('ytdl-core');
const {chain,  forEach } = require('lodash');
const ffmpegPath=require('ffmpeg-static')
const {spawn}=require('child_process')
const sanitize=require('sanitize-filename')




port=4000

app.use(express.json())
app.use (cors());

const getResu = (formats) => {
    let resuArray = [];

    for (let i = 0; i < formats.length; i++) {
        if (formats[i].qualityLabel !== null) {
            resuArray.push(formats[i]);
        }
    }

    // Remove duplicates and return unique heights
    return [...new Set(resuArray.map((v) => v.height))];
};

app.get('/api/getVideoDetails/:videoId', async (req,res)=>{
    const {videoId}= req.params;
    const {videoDetails, formats}= await ytdl.getInfo(videoId);
   
    const title = videoDetails.title; // Access the title directly
    const thumbnail = videoDetails.thumbnails; // Access thumbnails array
    const videoResu= getResu(formats);
    return res.status(200).json({
        videoInfo:{
            title,
            thumbnailUrl:thumbnail[thumbnail.length -1 ].url,
            videoResu,
            lastResu: videoResu[0]

    }})

})



app.get('/video_download', async(req,res)=>{
    const {id, resu}=req.query;
    try{

        const {videoDetails:{title}, formats}= await ytdl.getInfo(id);

        console.log(formats)

        const videoFormat = chain(formats)
        .filter(({ height, codecs }) => height && height === parseInt(resu) && codecs && codecs.startsWith('avc1'))
        .orderBy('fps', 'desc')
        .head()
        .value();
    
    if (!videoFormat) {
        console.error(`No matching format for resolution: ${resu}`);
        return res.status(400).json({ error: `No video format found for resolution: ${resu}` });
    }
    

     

     

        const streams = {
            video: ytdl(id, { quality: videoFormat.itag }),
            audio: ytdl(id, { quality: 'highestaudio' }),
        };
        
     
     
 




        const pipes={
            out:1,
            err:2,
            video:3,
            audio:4
        }


        const ffmpegInputOption = {
            video: [
                '-i', `pipe:${pipes.video}`,
                '-i', `pipe:${pipes.audio}`,
                '-map', '0:v:0',
                '-map', '1:a:0',
                '-c:v', 'copy',
                '-c:a', 'aac',  // Switch to 'aac' codec for audio, if 'libmp3lame' is problematic
                '-crf', '27',
                '-preset', 'veryfast',
                '-movflags', 'frag_keyframe+empty_moov',
                '-f', 'mp4',
            ]
        }
       
        const ffmpegOption = [
            ...ffmpegInputOption.video,
            '-loglevel', 'debug',  // Change from 'error' to 'debug' for more detailed logs
            '-'
        ]
        

        const ffmpegProcess = spawn(
            ffmpegPath,
            ffmpegOption,
            {
                stdio: ['pipe', 'pipe', 'pipe', 'pipe', 'pipe']
            }
        )


        const errorHandle = err => console.log(err)
        forEach(streams, (stream, format) => {
            const dest = ffmpegProcess.stdio[pipes[format]];
            stream.pipe(dest).on('error', errorHandle);
        });
        

        console.log("Video Stream:", videoFormat);
        console.log("Audio Stream:", streams.audio);
        



        ffmpegProcess.stdio[pipes.out].pipe(res)
        let ffmpegLog=''


        ffmpegProcess.stdio[pipes.err].on(
            'data', chunk=> ffmpegLog+= chunk.toString()
        )

        ffmpegProcess.on(
            'exit',
            (exitCode) => {
                if (exitCode === 1) {
                    console.log(ffmpegLog)
                }
                res.end()
            }
        )

        ffmpegProcess.on(
            'close',
            () => ffmpegProcess.kill()
        )


        const filename=`${encodeURI(sanitize(title))}.mp4`

      
        res.setHeader('Content-Type', 'video/mp4')
        res.setHeader('Content-Disposition', `attachment;filename=${filename};filename*=uft-8''${filename}`)

        

    }catch(err){console.log(err)}
})



app.listen(port);     console.log(port)

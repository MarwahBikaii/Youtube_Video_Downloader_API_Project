import React from "react";
import axios from 'axios';
import {useState} from 'react';
import BounceLoader from 'react-spinners/BounceLoader'
import { useEffect } from "react";
const {chain, forEach} =require('lodash')



const Download=()=>{

    const [link,setLink]=useState("");
    const [videoInfo , setVideoInfo]= useState("");
    const [resu, setResu]=useState("");
    const [loader,setLoader]= useState(false);

    // Add this useEffect:
useEffect(() => {
    console.log("Updated resu:", resu);
  }, [resu]);
  

    const getVideoDetails= async(e)=>{
        e.preventDefault();
        
        const videoId= link.split('https://youtu.be/')[1]
        

        try{
            setLoader(true)
            const {data} = await axios.get(`http://localhost:4000/api/getVideoDetails/${videoId}`);
            setLoader(false)
           
            setVideoInfo(data.videoInfo);
            setResu(data.videoInfo.lastResu);
            
        }catch(err){ console.log(err)

        }
    }


    const video_download=()=>{

        const videoId= link.split('https://youtu.be/')[1]

        const url=`http://localhost:4000/video_download?id=${videoId}&resu=${resu}`
        window.location.href= url


    }
    
  return (
    <div className="DownloadDiv" style={{ textAlign: "center", marginTop: "20px" }}>
      <h1>YouTube Downloader</h1>
      <div>
        <form onSubmit={getVideoDetails}>
          <div>
            <input
              placeholder="Place YouTube video link here"
              onChange={(e) => setLink(e.target.value)}
              type="text"
              required
              style={{
                padding: "10px",
                width: "300px",
                borderRadius: "4px",
                marginRight: "10px",
                border: "1px solid #ccc",
              }}
            />
            <button
              type="submit"
              style={{
                padding: "10px 20px",
                borderRadius: "4px",
                backgroundColor: "#61dafb",
                color: "white",
                border: "none",
                cursor: "pointer",
              }}
            >
              Download
            </button>
          </div>
        </form>
      </div>

      <div style={{ marginTop: "20px" }}>
        {loader ? (
  <div style={{
    display: "flex", 
    justifyContent: "center", 
    alignItems: "center", 
    height: "30vh"
  }}>
            <BounceLoader color="#61dafb" size={60} />
          </div>
        ) : (
          videoInfo && (
            <div>
           
              <h2 style={{ marginTop: "10px" }}>{videoInfo.title}</h2>
                 <img
                src={videoInfo.thumbnailUrl}
                alt="Video Thumbnail"
                style={{
                  width: "100%",
                  maxWidth: "280px",
                  margin: "3%",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                }}
              />
            </div>

            
          )
        )}
      </div>
     
      <div>
  {videoInfo && videoInfo.videoResu && (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "10px" }}>
      <select onChange={(e) => setResu(e.target.value)}>
        {videoInfo.videoResu.map((v, i) => (
          <option key={i} value={v}>
            {v ? `${v}p` : ''}
          </option>
        ))}
      </select>

      <button
        onClick={video_download}
        style={{
          padding: "10px 20px",
          borderRadius: "4px",
          backgroundColor: "#61dafb",
          color: "white",
          border: "none",
          cursor: "pointer",
        }}
      >
        Download
      </button>
    </div>
  )}
</div>

      </div>
 
  );
};

export default Download;
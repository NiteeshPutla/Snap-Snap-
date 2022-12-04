import React, { useState ,useRef} from 'react'
import { useUploader } from '@w3ui/react-uploader'
import { useUploadsList } from '@w3ui/react-uploads-list'

import { withIdentity } from './components/Authenticator'
import {Camera} from 'react-camera-pro'
import './spinner.css'


function dataURLtoFile(dataurl){
  const arr=dataurl.split(',')
  const mine=arr[0].match(/:(.*?);/)[1]
  const bstr=atob(arr[1])
  let n=bstr.length
  const u8arr= new Uint8Array(n)
  while(n--){
    u8arr[n]=bstr.charCodeAt(n)
  }
  const blob=new Blob([u8arr], {type:mine})
  return new File([blob], 'camera-image')
}
export function ContentPage () {
  const [{ uploadedCarChunks }, uploader] = useUploader()
  const [file, setFile] = useState(null)
  const [dataCid, setDataCid] = useState('')
  const [status, setStatus] = useState('')
  const [error, setError] = useState(null)
  const camera=useRef(null)
  const[images,setImages]=useState([])

  const {loading, error:listError, data:listData, reload:listReload} = useUploadsList();

  if (!uploader) return null
 
  const takePhoto=async(e)=>{
    e.preventDefault()
    const imgdata = camera.current.takePhoto()

    try{
      setStatus('encoding')
      const theFile=dataURLtoFile(imgdata)
      setStatus('uploading')
      const cid=await uploader.uploadFile(theFile)
      setImages([{cid:cid, data:imgdata}, ...images])
    }catch(err){
      console.log(err)
      setError(err)
    }finally{
      setStatus('done')
    }
    
  }

  const handleUploadSubmit = async e => {
    e.preventDefault()
    try {
      setStatus('uploading')
      const cid = await uploader.uploadFile(file)
      setDataCid(cid)
    } catch (err) {
      console.error(err)
      setError(err)
    } finally {
      setStatus('done')
    }
  }
  const printStatus=status==='done'&& error ? error:status//checking the status of upload and printing it out.
  const printListData=(listData&&listData.results) || []


  return (
    <div>
      <p>
        <button onClick={takePhoto}>TakePhoto</button> {printStatus}
      </p>
      <Camera ref={camera}/>
      <ul className="images"></ul>
      {images.map(({cid,data})=>(
        <ImageListItem key={cid} data={data}/>
      ))}
      {printListData.map(({dataCid:cid})=>(  
      <ImageListItem key={cid} cid={cid}/>
      ))}
    </div>
  )
}

function ImageListItem({cid,data}){
  if(/bagb/.test(`${cid}`)){
    return <li key={cid}>CAR cid: {cid}</li>
  }

  const imgSrc=data|| `https://w3s.link/ipfs/${cid}`

  return(
    <li key={cid}>
      <a href={`https://w3s.link/ipfs/${cid}`}>
      <img width="200px" alt='camera output' src={imgSrc}/>
      </a>
    </li>
  )

}
export default withIdentity(ContentPage)

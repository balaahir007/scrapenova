"use client"
import { Button } from '@/components/ui/button'
import { BaseEdge, EdgeProps, getSmoothStepPath, EdgeLabelRenderer, useReactFlow} from '@xyflow/react'
import React from 'react'

function DeletetableEdge(props : EdgeProps) {
    const [edgePath,labelX , labelY] = getSmoothStepPath(props)

    const {setEdges} = useReactFlow()
  return (
    <>
     <BaseEdge path={edgePath} markerEnd={props.markerEnd} style={props.style}  />
     <EdgeLabelRenderer>
      <div style={{
        position : 'absolute',
        pointerEvents : 'all',
        transform : `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
      }} >
        <Button 
        onClick={()=>{
          setEdges((eds)=> eds.filter((e)=>e.id !== props.id))
        }}
        variant={'outline' } size={"icon"} className='w-5 h-5 border cursor-pointer rounded-full text-xs leading-none  hover:shadow-lg '
           >x</Button>
      </div>
     </EdgeLabelRenderer>
    </>
  )
}

export default DeletetableEdge

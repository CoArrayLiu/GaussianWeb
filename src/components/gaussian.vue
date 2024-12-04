<template>
    <div id="container"></div>
  </template>
  
  <script>
  import * as GaussianSplats3D from '@mkkellogg/gaussian-splats-3d';
  
  
  export default {
    name: 'PointCloudViewer',
    mounted() {
      const viewer = new GaussianSplats3D.Viewer({
        'cameraUp': [0, -1, -0.6],
        'initialCameraPosition': [-1, -4, 6],
        'initialCameraLookAt': [0, 4, 0]
      });
  
      // Ensure the path to your model is correct (e.g., check public folder)
      viewer.addSplatScene('model.ply', {
        'splatAlphaRemovalThreshold': 5,
        'showLoadingUI': true,
        'position': [0, 1, 0],
        'rotation': [0, 0, 0, 1],
        'scale': [1.5, 1.5, 1.5]
      })
      .then(() => {
        viewer.start();
      }).catch((error) => {
        console.error('Error loading the model:', error);
      });
    }
  };
  </script>
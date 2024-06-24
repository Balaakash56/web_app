<html>
<head>
  <title>File Upload App</title>
</head>
<body>
  <h1>File Upload App</h1>
  <form id="uploadForm">
    <input type="file" id="fileInput" />
    <button type="submit">Upload</button>
  </form>
  <ul id="fileList"></ul>
  <script>
    const uploadForm = document.getElementById('uploadForm');
    const fileInput = document.getElementById('fileInput');
    const fileList = document.getElementById('fileList');

    uploadForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const file = fileInput.files[0];
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer YOUR_JWT_TOKEN`
        },
        body: formData
      });
      const data = await response.json();
      const li = document.createElement('li');
      li.textContent = data.url;
      fileList.appendChild(li);
    
      </script>
</body>
</html>

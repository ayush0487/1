import * as fs from 'fs';
export const readFile = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

export const writeFile = (filePath, data) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, JSON.stringify(data, null, 2), (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

export const getData = async (filePath) => {
  try {
    const data = await readFile(filePath);
    if(!data) {
      return [];
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading or parsing file:', error);
    return [];
  }
};

export const saveData = async (filePath, data) => {
  try {

    await writeFile(filePath, data);
  } catch (error) {
    console.error('Error writing to file:', error);
  }
};
export const formateData = async(data, filePath)=>{
    try {
        
    } catch (error) {
        
    }
    const formattedData = {};
    const fileData =await getData(filePath);

    fileData.push(data);
    await saveData(filePath,fileData);
    return formattedData;
}

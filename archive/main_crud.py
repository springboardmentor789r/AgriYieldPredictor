from fastapi import FastAPI, HTTPException
from models.crop import Crop

app = FastAPI(title="Simple CRUD with List")
crops: list[Crop] = []

@app.post("/crops", response_model=Crop)
def create_crop(crop: Crop):
    if any(c.id == crop.id for c in crops):
        raise HTTPException(status_code=400, detail="ID already exists")
    crops.append(crop)
    return crop

@app.get("/crops", response_model=list[Crop])
def get_crops():
    return crops

@app.get("/crops/{crop_id}", response_model=Crop)
def get_crop(crop_id: int):
    for c in crops:
        if c.id == crop_id:
            return c
    raise HTTPException(status_code=404, detail="Crop not found")

@app.put("/crops/{crop_id}", response_model=Crop)
def update_crop(crop_id: int, updated: Crop):
    for i, c in enumerate(crops):
        if c.id == crop_id:
            crops[i] = updated
            return updated
    raise HTTPException(status_code=404, detail="Crop not found")

@app.delete("/crops/{crop_id}")
def delete_crop(crop_id: int):
    for i, c in enumerate(crops):
        if c.id == crop_id:
            deleted = crops.pop(i)
            return {"message": "Deleted", "crop": deleted}
    raise HTTPException(status_code=404, detail="Crop not found")

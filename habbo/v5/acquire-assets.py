"""Preserve observed source bytes; no generated or redrawn artwork.
Usage: python acquire-assets.py ledger.json kind
"""
import concurrent.futures, hashlib, json, pathlib, sys, urllib.request
from PIL import Image
ROOT=pathlib.Path(__file__).resolve().parents[1]
ledger=json.loads(pathlib.Path(sys.argv[1]).read_text())
items=ledger if isinstance(ledger,list) else ledger.get('items',ledger.get('candidates',[]))
kind=sys.argv[2]
def fetch(item):
    url=item.get('sourceImage') or item.get('imageUrl') or item.get('source_image_url')
    if not url:return dict(id=item.get('id'),error='missing observed URL')
    try:
        req=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0 (noncommercial historical archive)'})
        data=urllib.request.urlopen(req,timeout=35).read()
        suffix=pathlib.Path(url.split('?')[0]).suffix.lower()
        if suffix not in ['.gif','.png','.jpg','.jpeg','.webp']:suffix='.gif'
        out=ROOT/'source-input'/'v5-originals'/kind/(item['id']+suffix)
        out.parent.mkdir(parents=True,exist_ok=True);out.write_bytes(data)
        im=Image.open(out);im.verify()
        im=Image.open(out)
        return dict(id=item['id'],sourceUrl=url,sha256=hashlib.sha256(data).hexdigest(),bytes=len(data),width=im.width,height=im.height,format=im.format,original=str(out.relative_to(ROOT)),assetName=out.name)
    except Exception as e:return dict(id=item.get('id'),sourceUrl=url,error=str(e))
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as ex:results=list(ex.map(fetch,items))
path=ROOT/'data'/('v5-'+kind+'-asset-manifest.json');path.write_text(json.dumps(results,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'total':len(results),'valid':sum('error' not in x for x in results),'errors':[x for x in results if 'error' in x]},ensure_ascii=False))

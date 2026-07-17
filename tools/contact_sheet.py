import sys, os, glob
from PIL import Image, ImageDraw
d=sys.argv[1]; cols=int(sys.argv[2]) if len(sys.argv)>2 else 3
files=sorted(f for f in glob.glob(os.path.join(d,'*.png')) if 'contact_sheet' not in f)
if not files: print('no files'); sys.exit()
tw=460; pad=12; labelh=22; cap=360
rows=(len(files)+cols-1)//cols
cellh=cap+labelh
sheet=Image.new('RGB',(cols*tw+(cols+1)*pad, rows*(cellh+pad)+pad),'#efeae0')
dr=ImageDraw.Draw(sheet)
for i,f in enumerate(files):
    im=Image.open(f).convert('RGB'); th=int(im.height*tw/im.width)
    im=im.resize((tw,th)).crop((0,0,tw,min(th,cap)))
    c=i%cols; r=i//cols; x=pad+c*(tw+pad); y=pad+r*(cellh+pad)
    dr.text((x+2,y+5),os.path.basename(f),fill='#1f2937')
    sheet.paste(im,(x,y+labelh))
out=os.path.join(d,'contact_sheet.png'); sheet.save(out); print('sheet',out,sheet.size,len(files),'imgs')

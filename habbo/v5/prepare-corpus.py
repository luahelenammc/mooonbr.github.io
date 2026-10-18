"""Project research ledgers into public collection data; fail closed on eligibility."""
import collections,json,pathlib,sys
ROOT=pathlib.Path(__file__).resolve().parents[1]
RESEARCH=pathlib.Path(sys.argv[1])
for kind in ['rares','badges']:
    ledger=json.loads((RESEARCH/(kind+'-ledger.json')).read_text())
    records=ledger.get('items',ledger.get('selected',[]))
    sources={s['id']:s['url'] for s in ledger.get('sources',[])}
    groups={g['id']:g['name'] for g in ledger.get('groups',[])}
    enrichment=json.loads((RESEARCH/'badges-context-enrichment.json').read_text()) if kind=='badges' and (RESEARCH/'badges-context-enrichment.json').exists() else {}
    selected=[]
    familyNames={'dragon-lamps':('Lâmpadas dragão','Dragon lamps'),'pillows':('Almofadas','Pillows'),'ice-cream-machines':('Sorveteiras','Ice cream machines'),'fans':('Ventiladores','Fans'),'pillars':('Colunas','Pillars'),'parasols':('Parasóis','Parasols'),'amber-lamps':('Lâmpadas de âmbar','Amber lamps'),'elephants':('Elefantes','Elephants'),'holograms':('Hologramas','Holograms'),'eggs':('Ovo de dinossauro','Dinosaur egg'),'samovars':('Samovares','Samovars'),'thrones':('Trono','Throne'),'typewriters':('Máquina de escrever','Typewriter'),'floor-patches':('Tapetes de pétalas','Petal patches')}
    for r in records:
        if r['cutoffStatus']!='verified_pre2012':continue
        images=list((ROOT/'assets'/'v5'/kind).glob(r['id']+'.*'))
        if not images:continue
        q=dict(r)
        q['image']='/habbo/'+str(images[0].relative_to(ROOT))
        q['rightsStatus']='approved_under_policy'
        q['rightsBasis']='Conditional noncommercial fansite reuse of released Sulake sprites; independent design, provenance and mandatory disclaimer. See docs/HABBO_V5_RIGHTS_REVIEW.md. Revocable; not an open license or individual Sulake approval.'
        q['provenanceRefs']=[sources.get(x,x) if isinstance(x,str) else x for x in r['provenanceRefs']]
        q['code']=r.get('badgeCode',r.get('assetName',r['id']))
        q['description']=r.get('context',r.get('description',{}))
        if r['id'] in enrichment:q.update(enrichment[r['id']])
        if kind=='rares':
            q['description']=r.get('description',{})
            q['nameNote']={'ptBr':'Nomes em português são identificações editoriais; a grafia oficial BR não foi verificada.','en':'Portuguese names are editorial identifications; official Brazilian wording has not been verified.'}
            names=familyNames.get(r['familyId'],(r['familyId'],r['familyId']))
            q['familyName']={'ptBr':names[0],'en':names[1]}
            q['dateEvidence']={'ptBr':'Data de circulação mais antiga localizada nesta tabela: '+str(r.get('firstDocumentedInternationalReleaseDate') or 'não comprovada')+'. Não comprova a primeira estreia mundial.','en':'Earliest documented circulation in this table: '+str(r.get('firstDocumentedInternationalReleaseDate') or 'unconfirmed')+'. This does not establish the worldwide debut.'}
        else:q['groupName']=groups.get(r.get('groupId'))
        if kind=='rares':
            m=r.get('releaseMechanism','unknown')
            labels={'catalogue':('catálogo','catalogue'),'competition':('competição','competition'),'promotion':('promoção','promotion'),'gift':('presente','gift'),'unknown':('não comprovado neste recorte','not established in this selection')}
            pt,en=labels.get(m,('outro mecanismo documentado','other documented mechanism'))
            q['historicalContext']={'ptBr':'Obtenção: '+pt+'. Variante: '+str(r.get('variantId') or 'única')+'.','en':'Acquisition: '+en+'. Variant: '+str(r.get('variantId') or 'single')+'.'}
        q['year']=r.get('originalIssueDate') or r.get('year')
        if kind=='badges':
            q['dateEvidence']={'ptBr':'Data explícita na nota individual do arquivo regional: '+str(q['year'])+'. Não equivale necessariamente ao dia de distribuição.','en':'Explicit date in the regional archive item note: '+str(q['year'])+'. This does not necessarily establish the distribution day.'}
            q['nameNote']={'ptBr':'Identificação editorial; associação BR/PT conforme arquivo regional. Data exata e tarefa de obtenção não estabelecidas.','en':'Editorial identification; BR/PT association follows the regional archive. Exact issue date and acquisition task are not established.'}
        if q.get('description',{}).get('ptBr'):
            translated=q['description']['ptBr']
            for a,b in [('January','janeiro de'),('February','fevereiro de'),('March','março de'),('April','abril de'),('May','maio de'),('June','junho de'),('July','julho de'),('August','agosto de'),('September','setembro de'),('October','outubro de'),('November','novembro de'),('December','dezembro de'),('Contest prize','prêmio de concurso'),('Competition prize','prêmio de competição'),('Habbo imager competition','concurso de Habbo imager'),('Club Shop','loja do clube')]:translated=translated.replace(a,b)
            q['description']['ptBr']=translated
        q.pop('localOriginal',None)
        if q.get('assetVerification'):q['assetVerification'].pop('localPath',None)
        if kind=='badges':
            q['hotelStatus']='unknown'
            q['regionalAssociation']='br_pt_documented'
        if kind=='badges':q['hotelLabel']={'ptBr':'Associação BR/PT documentada no arquivo regional; emissão específica no Brasil não estabelecida.','en':'BR/PT association documented in the regional archive; Brazil-specific issue not established.'}
        selected.append(q)
    if kind=='rares':
        selected.sort(key=lambda r:(r['familyId']!='dragon-lamps',r['familyId'],r['hotelStatus']!='br_documented',r['id']))
    (ROOT/'data'/('v5-'+kind+'.json')).write_text(json.dumps(selected,ensure_ascii=False,indent=2)+'\n')
    (ROOT/'data'/('HABBO_V5_'+kind.upper()+'_CANDIDATE_AND_SELECTION_LEDGER.json')).write_text(json.dumps(ledger,ensure_ascii=False,indent=2)+'\n')
    print(kind,len(records),len(selected),dict(collections.Counter(r['hotelStatus'] for r in selected)))

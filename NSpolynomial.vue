<script>
function isEmptyObject(obj) {
    for (var key in obj) {
        return false;
    }
    return true;
}
    
class polynomial{
    constructor(pol){
        this.pol = {};
        var reg = '^(\\-|\\+)?(([0-9])+(\\.[0-9]+)|(([0-9])*))([a-zA-Z](\\^[0-9]+)?)*$';
        var co, ex;
        var tadashii;
        var temp;
        var poli;
        
        pol = pol.replace(/\-/g,'+-');
        if(pol[0] == '+')pol = pol.slice(1,);
        pol = pol.split('+');
        
        for (var i in pol){
            tadashii = RegExp(reg).test(pol[i]) && !( pol[i] == '' || pol[i] == '-' );
            if(!tadashii){this.pol = null;break;}
            
            co = pol[i].split(/[a-zA-Z]/)[0];
            pol[i] = pol[i].slice(co.length,);
            
        poli = pol[i].match(/[a-zA-Z](\^([0-9]+)?)?/g);
            if(poli == null)poli = [];
                
            for(var j=0 ;  j < poli.length ; j++){
                temp = poli[j].match(/[0-9]+/);
                if(temp == null)poli[j] = [poli[j],1];
                else if(temp == 0)poli[j] = ['',1];
                else poli[j] = [poli[j][0],temp];
                
                for(var k=0;k<j;k++){
                    if(poli[j][0] == poli[k][0]){
                        poli[k][1] = parseFloat(poli[j][1]) + parseFloat(poli[k][1]);
                        poli.splice(j,1);
                        j-=1;
                    }
                }
            }
            
            poli = poli.sort();
            if(co == ''){co = 1;}
            else if(co == '-'){co = -1;}
            else {co = parseFloat(co);}
            
            if(poli.toString() != ''){
                ex = '';
                for(var j in poli){
                    ex += poli[j][0] + parseInt(poli[j][1]);
                }
            }
            else{
                ex = '1';
            }
            
            if(ex in this.pol){
                this.pol[ex] = parseFloat(co) + parseFloat(this.pol[ex]);
            }
            else{
                this.pol[ex] = parseFloat(co);
            }
        }
        
        for(var i in this.pol){
            if(this.pol[i] == 0){
                delete this.pol[i];
            }
        }
        if(isEmptyObject(this.pol) && this.pol != null)this.pol['1'] = 0;
    }
    
    static multiply(pol){
        var chk = polynomial.check(pol);
        if(!chk.response){
            return chk.error_message;
        }
        var Me, Mc, Be, Bc;//M乘數 B被乘數 e指數部分 c係數部分
        var tempE, tempi, tempans = [];
        var Mpol,Bpol = pol[0];
        
        for(var z=1;z<pol.length;z++){
            Mpol = pol[z].pol;
            tempans = [];
            Bpol = Bpol.pol;
            for(var i in Mpol){
                Me = i == '1' ? '' : i;
                Mc = Mpol[i];
                var L = tempans.length;
                tempans[L] = new polynomial('0');
                for(var j in Bpol){
                    tempi = [];
                    Be = j == '1' ? '' : j;
                    Bc = Bpol[j];
                    tempE = Be+Me;
                    
                    tempE = tempE.match(/[a-zA-Z][0-9]+/g);
                    for(var k in tempE){
                        tempi[tempi.length] = [tempE[k][0], tempE[k].slice(1,)];
                        
                        for(var I=0; I<tempi.length-1; I++){
                            if( tempi[I][0] == tempi[tempi.length-1][0] ){
                                tempi[I][1] = parseFloat(tempi[I][1]) + parseFloat(tempi[tempi.length-1][1]) ;
                                tempi.splice(tempi.length-1,1);
                                break;
                            }
                        }
                    }    
                        tempi = tempi.sort();
                        tempE = tempi.join('').replace(/\,/g,'');
                        
                        if(tempE == '')tempE = '1';
                        if(tempE in tempans[L].pol){
                            tempans[L].pol[tempE] = parseFloat(tempans[L].pol[tempE]) + parseFloat(Mc) * parseFloat(Bc);
                        }
                        else{
                            tempans[L].pol[tempE] = parseFloat(Mc) * parseFloat(Bc);
                        }
                        
                        for(var I in tempans[L]){
                            if(tempans[L].pol[I] == 0)delete tempans[L].pol[I];
                        }
                }
            }
            Bpol = this.merge(tempans);
        }
        return Bpol;
    }
    
    static merge(pol){
        var chk = polynomial.check(pol);
        if(!chk.response){
            return chk.error_message;
        }
        pol = [new polynomial('0')].concat(pol);
        for(var i=1;i<pol.length;i++){
            for(var j in pol[i].pol){
                
                if(j in pol[0].pol){
                    pol[0].pol[j] = parseFloat(pol[0].pol[j]) + parseFloat(pol[i].pol[j]);
                }
                else{
                    pol[0].pol[j] = parseFloat(pol[i].pol[j]);
                }
            }
        }
        for(i in pol[0].pol){
            if(pol[0].pol[i] == 0)delete pol[0].pol[i];
        }
        if(isEmptyObject(pol[0].pol))pol[0].pol['1'] = 0;
        return pol[0];
    }
        
    static check(pol){
        for(var i in pol){
            if(pol[i].constructor.name != polynomialName)return {'response':false,'error_message':'第'+(parseFloat(i)+1)+'項的\"'+pol[i]+'\"不是多項式物件(polynomial object)'};
        }
        return {'response':true,'error_message':'none'};
    }
    
    to_katex(){
        var ktext = '';
        var a;
        for(var i in this.pol){
            var poli = this.pol[i];
            if(i != '1'){
                var ex = i.replace(/(?<![0-9]+)1(?![0-9]+)/g,'');
                while( (a = ex.match(/[a-zA-Z][0-9]+/)) != null )ex = ex.replace(a[0],a[0][0]+'^{'+a[0].slice(1,)+'}');
                if(poli == '1')ktext += '+' + ex;
                else if(poli == '-1')ktext += '-' + ex;
                else if(poli > 0)ktext += '+'+ poli + ex;
                else ktext += poli + ex;
            }
            else {
                ktext += '+' + poli;
            }
        }
        if(ktext[0] == '+')return ktext.slice(1,);
        return ktext;
    }
    
    get katexmode(){
        return this.to_katex();
    }
    get copymode(){
        return this.katexmode.replace(/\{|\}/g,'');
    }
}
class formula{
    constructor(fma,alg){
        this.org = fma;
        var a,b,i;
        if(!alg)alg = '';
        alg = alg.split(',');
        for(var i in alg){
            a = alg[i].split('=');
            if(a.length==2)fma = fma.replace(RegExp(a[0],'g'),'('+a[1]+')');
        }
        while( (a = fma.match(/([a-zA-Z0-9\.]+|\))\(/)) != null)fma = fma.replace(a[0],a[0].slice(0,a[0].length-1)+'*(');
        while( (a = fma.match(/\)([a-zA-Z0-9\.]+)/)) != null)fma = fma.replace(a[0],')*' + a[0].slice(1,));
        this.fma = '(' + fma + ')';
    }
    
    check(){
        var a,b,c;
        var fma = this.fma;
        
        if(fma[0] != "(" && fma[fma.length-1] != ")") fma = "(" + fma + ")";
        //'(x^2+y)'.match(/(?<=(\([a-zA-Z0-9\+\-\*\(\)\^\.]+\)))(\^[0-9]+|\^\([0-9\+\-\*]+\))/)
        while( c != fma){
            c = fma;
            //while( (a=fma.replace(/(?<=(\([a-zA-Z0-9\+\-\*\(\)\^\.]+\)))(\^[0-9]+|\^\([0-9\+\-\*]+\))/g,''))!=fma )fma = a;console.log(c);
            while( (a=fma.replace(/\^[0-9]+|\^\([0-9\+\-\*]+\)/g,''))!=fma )fma = a;
            while((b = fma.replace(/[a-zA-Z0-9\.]+\*[a-zA-Z0-9\.]+/g,'1')) !=fma)fma = b;
            while( (a = fma.match(/\([a-zA-Z0-9\+\-\.]*\)/)) != null){
                a = a[0].replace(/\(|\)/g,'');
                var pol = new polynomial(a);
                
                if (pol.pol != null){
                    fma = fma.replace('('+a+')','1');
                }
                else return false;
            }
            fma = fma.replace(/[a-zA-Z0-9\.]\^[0-9]+/g,'1');
        }
        if(fma != '1')return false;
        return true;
    }
    pow(a,b){
        if(b>1 && b%2 == 0)return this.pow('('+a+'*'+a+')',b/2);
        else if(b>1)return '(' + a +'*' + this.pow(a,b-1) + ')';
        return a;
    }
    calculate(){
        if(this.check() == false){this.fma = '多項式算式有誤';return this};
        this.fma = this.fma.replace(/\-(?=([a-zA-Z0-9\^\.])*\*?\()/g,'+(-1)*');
        var a;
        while( a != this.fma){
            a = this.fma;//console.log(this.fma);
            this.fma = this.simplify();//console.log(this.fma);
            this.fma = this.catch_exp();//console.log(this.fma);
            this.fma = this.catch_mul();
        }
        
        return this;
    }
    simplify(){
        var reg = /(?<!\*)\([a-zA-Z0-9\.\+\-\^]+\)(?!(\*|\^))/;
        var fma = this.fma,b,c,i
        while( (b = fma.match(reg)) != null){
            i = b.index;
            c = [new polynomial(b[0].replace(/\(|\)/g,''))];
            if(c[0].pol == null)break;
            fma = (fma.slice(0,i) + fma.slice(i,).replace(b[0],polynomial.merge(c).copymode)).replace(/\+\-/g,'-');
        }//console.log(fma);
        return fma;
    }
    catch_mul(){
        var reg = /((\([a-zA-Z0-9\+\-\^\.]+\)|[a-zA-Z0-9\^\.]+)\*)+((\([a-zA-Z0-9\+\-\^\.]+\)|[a-zA-Z0-9\^\.]+)|(\([a-zA-Z0-9\+\-\^\.]+\)))(?!\^)/g;
        var fma = this.fma,a,b,i,j;
        while( (a = fma.match(reg)) != null){
            for(i in a){//分割
                b = a[i].replace(/\(|\)/g,'').split('*');
                for(j in b){//改成多項式形式
                    b[j] = new polynomial(b[j]);
                }
                fma = fma.replace(a[i],'('+polynomial.multiply(b).copymode+')');
            }
            
            if(fma == '')fma = '0';
        }//console.log(fma);
        return fma;
    }
    
    catch_exp(){
        var reg = /(\([a-zA-z0-9\+\-\^\*\.]+\)|[0-9\.]+)\^[0-9]+/g;
        var fma = this.fma,c,d,e,i;
        while( (c = fma.match(reg)) != null){
            for(i in c){
                d = c[i].replace(/(\([a-zA-z0-9\+\-\^\*\.]+\)|[0-9\.]+)\^/,'');
                if(d == 0)e = '1';
                else if(d == 1)e = c[i].split('^')[0];
                else{
                    //e = this.pow(c[i].split('^')[0],d);
                    e = this.pow(c[i].slice(0,c[i].match(/(?<=\)\^)/).index-1),d);
                }
                fma = fma.replace(c[i],e);
            }
        }//console.log(fma);
        return fma;
    }
}

const polynomialName = (new polynomial("")).constructor.name;
const formulaName = (new formula("")).constructor.name;
export { polynomial, formula };
</script>
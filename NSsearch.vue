<script>
const search3 = (data) => {
        function getD(ex, e, n) {
            var tmp = [], r = n ? n : 1;
            for (var i in e) {
                if (i in ex) continue;
                if (typeof e[i] == 'object') {
                    tmp.push(getD(ex, e[i], r + 1));
                }
                else {
                    tmp.push(r);
                }
            }
            return [tmp];
        }

        function findEx(a, Ex) {
            if (!Array.isArray(a)) return [NaN, NaN];
            if (!Ex) Ex = [];
            for (var i in a) {
                if (!Array.isArray(a[i])) {
                    Ex[0] = Ex[0] == undefined ? a[i] : Ex[0] > a[i] ? Ex[0] : a[i];
                    Ex[1] = Ex[1] == undefined ? a[i] : Ex[1] < a[i] ? Ex[1] : a[i];
                }
                else {
                    var t = findEx(a[i], Ex);
                    Ex[0] = Ex[0] == undefined ? t[0] : Ex[0] > t[0] ? Ex[0] : t[0];
                    Ex[1] = Ex[1] == undefined ? t[1] : Ex[1] < t[1] ? Ex[1] : t[1];
                }
            }
            return Ex;
        }

        function rnd(n) {
            var r = "", x = "qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM";
            for (var i = 0; i < n; i++) r += x[parseInt(Math.random() * 52)];
            return r;
        }

        function findbracket(txt) {
            var rplLeng = 10;
            var word, reg, rb, rb2, brackets = [], bracketsTrans, codeDict = {}, rpl, prerpl = [], codeTmp;

            word = "[\\w\\.\\u4E00-\\u9FFF]+";
            reg = new RegExp("!?\\(" + word + "(\\&" + word + ")+\\)|!?(?<=\\()" + word + "(\\&" + word + ")+|" + word + "(\\&" + word + ")+(?=\\))|(?<!\\()!?" + word + "(\\&" + word + ")+(?!\\))", "g");
            rb = new RegExp(/\([^(^)^{^}]+\)/);
            rb2 = new RegExp(/{[^(^)^{^}]+}/);
            bracketsTrans = { '(': ')', ')': '(', '{': '}', '}': '{' };

            var a = txt.match(reg);// console.log(a, txt, codeDict)
            for (i in a) if (a[i] != txt && a[i][0] != '(') txt = txt.replaceAll(a[i], '(' + a[i] + ')');
            while ((rpl = (txt.match(rb) || txt.match(rb2)))) {
                codeTmp = rnd(rplLeng);
                codeDict[codeTmp] = rpl[0];
                txt = txt.replace(rpl[0], codeTmp);
            }

            var a = txt.match(reg);// console.log(a, txt, codeDict)
            for (i in a) if (a[i] != txt && a[i][0] != '(') txt = txt.replaceAll(a[i], '(' + a[i] + ')');
            var L = txt.length, r = [''], t = 0;
            for (var i = 0; i < L; i++) {
                if ('\n\t\r\b\0'.includes(txt[i])) continue;
                if (txt[i] == '(' || txt[i] == '{') {
                    brackets.push(txt[i])
                }
                else if (txt[i] == ')' || txt[i] == '}') {
                    if (brackets.last() == bracketsTrans[txt[i]]) {
                        brackets.pop();
                    }
                    else {
                        return "syntax error"
                    }
                }
                if (!brackets.length && (txt[i] == '&' || txt[i] == ',')) {
                    t++;
                    r[t] = ''
                }
                if ('.|*+/\\\'\"[]'.includes(txt[i])) r[t] += '\\'
                r[t] += txt[i];

            }
            for (i in r) {
                rpl = r[i].match("[A-Za-z]{" + rplLeng + "}", "g");
                while (rpl && !_.isEqual(rpl, prerpl)) {
                    prerpl = rpl;
                    for (var j in rpl) {
                        if (rpl[j] in codeDict) {
                            r[i] = r[i].replace(rpl[j], codeDict[rpl[j]])
                        }
                    }
                    rpl = r[i].match("[A-Za-z]{" + rplLeng + "}", "g");
                }
            }
            return r;
        }

        function regular(sd, option) {
            var part = findbracket(sd.trim().replaceAll(')(', '),(').replaceAll(/\s*([!\&,\(\)])\s*/g, '$1').replace(/,+/g, ',')), r = '', L = 0, pl, tmp = [], b, sliceST = 2;
            if (!option) option = {};
            if (part == "syntax error") return "syntax error";
            part = Object.keys(part.reduce(function (a, e) { a[e[0] == ',' ? e.slice(1) : e] = 1; return a; }, {}));
            pl = part.length;
            for (var i = 0; i < pl; i++) {
                b = 0;
                for (var j = 0; j < pl; j++) {
                    if (i == j) continue;
                    b |= part[j].match(part[i]);
                    if (b) break;
                }
                if (!b && !(part[i] == '&' || part[i] == ',' || part[i] == '')) tmp.push(part[i]);
            }
            part = [];
            part[0] = tmp[0] == undefined ? '' : tmp[0];
            pl = tmp.length;
            for (var i = 1; i < pl; i++) {
                if (tmp[i][0] != '&') part[i] = ',' + tmp[i];
                else part[i] = tmp[i];
            }
            for (var i = 0; i < pl; i++) {
                var n = part[i].length;
                if (part[i][0] == '&') {
                    sliceST = part[i][1] == '!' ? 3 : 2;
                    if (part[i].match(/^\&!?\(.+\)$/)) {
                        if (Array.isArray(r)) r.push(regular(part[i].slice(sliceST, n - 1), { not: sliceST - 2 }));
                        else {
                            r = [r, regular(part[i].slice(sliceST, n - 1), { not: sliceST - 2 })];
                            r.not = option.not ? 1 : 0;
                            r.in = option.in;
                        }
                    }
                    else if (part[i].match(/^\&!?\{.+\}$/)) {
                        tmp = part[i].slice(sliceST, n - 1).split(":");
                        if (Array.isArray(r)) r.push(regular(tmp.slice(1).join(":"), { not: sliceST - 2, in: tmp[0] }));
                        else {
                            r = [r, regular(tmp.slice(1).join(":"), { not: sliceST - 2, in: tmp[0] })];
                            r.not = option.not ? 1 : 0;
                            r.in = option.in;
                        }
                    }
                    else {
                        if (Array.isArray(r)) r.push(part[i].slice(1));
                        else {
                            r = [r, part[i].slice(1)];
                            r.not = option.not ? 1 : 0;
                            r.in = option.in;
                        }
                    }
                }
                else if (part[i][0] == ',') {
                    sliceST = part[i][1] == '!' ? 3 : 2;
                    if (typeof r == "object") L = Object.keys(r).length - ('not' in r ? 1 : 0) - ('in' in r ? 1 : 0);
                    if (part[i].match(/^\,!?\(.+\)$/)) {
                        if (!Array.isArray(r) && typeof r == 'object') {
                            r[L] = regular(part[i].slice(sliceST, n - 1), { not: sliceST - 2 });
                            L++;
                        }
                        else {
                            r = { 0: r, 1: regular(part[i].slice(sliceST, n - 1), { not: sliceST - 2 }), not: option.not ? 1 : 0, in: option.in }
                        }
                    }
                    else if (part[i].match(/^\,!?\{.+\}$/)) {
                        tmp = part[i].slice(sliceST, n - 1).split(":");
                        if (!Array.isArray(r) && typeof r == 'object') {
                            r[L] = regular(tmp.slice(1).join(":"), { not: sliceST - 2, in: tmp[0] });
                            L++;
                        }
                        else {
                            r = { 0: r, 1: regular(tmp.slice(1).join(":"), { not: sliceST - 2, in: tmp[0] }), not: option.not ? 1 : 0, in: option.in }
                        }
                    }
                    else {
                        if (!Array.isArray(r) && typeof r == 'object') {
                            r[L] = part[i].slice(1);
                            L++;
                        }
                        else {
                            r = { 0: r, 1: part[i].slice(1), not: option.not ? 1 : 0, in: option.in }
                        }
                    }
                }
                else {
                    sliceST = part[i][0] == '!' ? 2 : 1;
                    if (part[i].match(/^!?\(.+\)$/)) {
                        r = regular(part[i].slice(sliceST, n - 1), { not: sliceST - 1, in: option.in });
                        r.not = sliceST - 1;
                    }
                    else if (part[i].match(/^!?\{.+\}$/)) {
                        tmp = part[i].slice(sliceST, n - 1).split(":");
                        r = regular(tmp.slice(1).join(":"), { not: sliceST - 1, in: tmp[0] });
                        if (typeof r != "object") r = [r];
                        r.not = sliceST - 1;
                        r.in = tmp[0];
                        if (part[i + 1]) {
                            if (part[i + 1][0] == "&") {
                                r = [r];
                            }
                            else if (part[i + 1][0] == ",") {
                                r = { 0: r };
                            }
                        }
                    }
                    else {
                        r = part[i];
                    }
                }
            }
            return r;
        }

        function toBoolean(arg, opt) {
            var r, tf;
            if (opt != undefined) tf = opt;
            else if (Array.isArray(arg)) tf = 1;
            else if (typeof arg == 'object') tf = 0;
            else return arg ? 1 : 0;

            r = tf;
            for (var i in arg) {
                if (tf) {
                    r &= toBoolean(arg[i], opt);
                    if (!r) return r;
                }
                else {
                    r |= toBoolean(arg[i], opt);
                    if (r) return r;
                }
            }
            return r;
        }

        function fitone(sdg, sf, ex, sp, tr) {
            var tri = tr;
            if (sf == null || sf == undefined) return 0;
            if (typeof sf == 'object') {
                for (var i in sf) {
                    if (i in ex) continue;
                    //console.log(i,tr,tr[i]?tr[i][sf[i]]:0,sf[i]);
                    if (i in tr) tri = tr[i];
                    if (fitone(sdg, sf[i], ex, sp, tri)) return 1;
                }
                return 0;
            }
            else {
                var tmp = sdg.match(/^!?\$(\d+(\.\d+)?)?\~\d+(\.\d+)?(\\\*\d+(\.\d+)?)?/);
                if (sdg[0] == "!") sdg = sdg.slice(1);
                if (tmp) {
                    var t = tmp[0].slice(1).split(/[\~(\\\*)]/), k = t[2] || t[3], n = sf,
                        m = (t[0] == '' ? NaN : parseFloat(t[0])) * (k == undefined ? 1 : k),
                        M = (t[1] == '' ? NaN : parseFloat(t[1])) * (k == undefined ? 1 : k);
                    if (typeof n != 'number') {
                        n = sf.replace(/,/g, "").match(/\d+(\.\d+)?/g);
                        for (var i in n) {
                            if ((isNaN(m) || m <= n[i]) && (isNaN(M) || n[i] <= M)) return 1;
                        }
                        return 0;
                    }
                    else {
                        return (isNaN(m) || m <= n) && (isNaN(M) || n <= M) ? 1 : 0;
                    }
                }
                else return (tr[sf] || sf).toString().match(sdg) ? 1 : 0;
            }
        }

        function fit(sdg, sf, ex, sp, tr) {
            var r;
            if (typeof sdg == 'object') {
                var type = Array.isArray(sdg);
                if (type) r = [];
                else r = {};

                for (var i in sdg) {
                    if (i == "not" || i == "in") continue;
                    r[i] = fit(sdg[i], sf, ex, sp, tr);//console.log(r[i], sf, sdg[i])
                    if (type ^ r[i]) return [r[i]];
                }
                // console.log(sdg, r);
                return r;
            }
            else {
                var not = sdg[0] == "!" ? 1 : 0;
                return fitone(sdg, sf, ex, sp, tr) ^ (not ^ 0);
            }
        }

        function filt(sdg, sf, ex, d, sp, tr) {
            var r, tri = tr;
            if (d > 0 && typeof sf == 'object') {
                if (Array.isArray(sf)) r = [];
                else r = {};

                for (var i in sf) {
                    if (i in ex) continue;
                    if (i in tr) tri = tr[i];
                    r[i] = filt(sdg, sf[i], ex, d - 1, sp, tri);
                }
                // console.log(sdg, r)
                return r;
            }
            else {// console.log(sdg, fit(sdg, sf, ex, sp, tr))
                return toBoolean(fit(sdg, sf, ex, sp, tr)) ^ (sdg.not ^ 0);
            }
        }

        function map(res, d) {
            var r;
            if (d > 0 && typeof res == 'object') {
                var type = Array.isArray(res);
                if (type) r = [];
                else r = {};
                for (var i in res) {
                    r[i] = map(res[i], d - 1);
                }
                for (var i in r) if (r[i] === 0 || (typeof r[i] == 'object' && !Object.keys(r[i]).length)) delete r[i];
                if (d == 1) {
                    if (type) return r.reduce(function (a, e, i) { if (e === 1) a.push(i); return a; }, []);
                    else return Object.keys(r);
                }
                if (type) {
                    var n = 0;
                    for (; i >= 0; i--)if (r[i] != undefined) { n = i; break; }
                    r = r.slice(0, n + 1);
                }
                return r;
            }
            else {
                return toBoolean(res);
            }
        }
        if (data == undefined || data.search_data == undefined || data.search_from == undefined) return 0;
        //var a;
        /*a=Date.now();*/var search_data_groups = regular(data.search_data);//console.log(Date.now()-a);
        if (search_data_groups == "syntax error") { console.log("syntax error"); return []; }
        var dimension = (data.search_depth && data.map_depth) ? [data.search_depth + 1, data.map_depth] : findEx(getD(data.exclude || {}, data.search_from));
        var search_depth = data.search_depth ? data.search_depth : dimension[0] - 1;
        var map_depth = data.map_depth ? data.map_depth : Math.min(search_depth, dimension[1]);
        var specify = false;

        /*console.log('-----------------------------------------------------');
        console.log(search_data_groups);
        console.log(search_depth, map_depth);
        console.log(filt(search_data_groups, search_from, data.exclude || [], search_depth, specify));*/
        //a=Date.now();var tm=filt(search_data_groups, data.search_from, data.exclude || [], search_depth, specify, data.trans || {});console.log(Date.now()-a);
        //a=Date.now();map(tm,map_depth);console.log(Date.now()-a);
        return map(filt(search_data_groups, data.search_from, data.exclude || {}, search_depth, specify, data.trans || {}), map_depth);
    }

    export { search3 };
</script>
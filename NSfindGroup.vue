<script>
    import { supfnc } from '@/js/NSsupportFnc.js'

    // find continual element group more than a minimum number in matrix
    var findContinue = (mat, minNum) => {
        if(!Array.isArray(mat)) return;
        var lineNum = 1;
        var res = [], resOld, c;

        for(var j=0; j<mat.length; j++){
            res.push([]);
            for(var i=0; i<mat[j].length; i++){
                res[j].push(0);
            }
        }

        var find = (x, y, num, count = 1) => {
            if(res[y][x] != 0 || mat[y][x] != num) return count - 1;
            res[y][x] = lineNum;

            if(x > 0) count = find(x-1, y, num, count + 1);
            if(y > 0) count = find(x, y-1, num, count + 1);
            if(x < mat[y].length-1) count = find(x+1, y, num, count + 1);
            if(y < mat.length-1) count = find(x, y+1, num, count + 1);

            return count;
        }

        for(var j=0; j<mat.length; j++){
            for(var i=0; i<mat[j].length; i++){
                resOld = res.duplicate();
                c = find(i, j, mat[j][i]);
                if(c < minNum){
                    res = resOld.duplicate();
                }
                else{
                    lineNum++;
                }
            }
        }
        return res;
    }

    // find max rectangle for element <tar> in matrix <mat>
    var findRect = (mat, tar, isSquare = 0) => {
        if (mat.length == 0) return 0;
        
        var col_nums = mat[0].length;
        var height = []; for(var i=0; i<col_nums; i++) height.push(0);
        var max_area = 0, area;
        var L, T, W, H;
        for (var i=0; i< mat.length;i++) {
            for(var j=0; j < col_nums; j++) {
                if (mat[i][j] != tar) {
                    height[j] = 0;
                } else {
                    height[j] += 1;
                }
            }

            for(var j=0;j<col_nums;j++) {
                if (height[j]==0) continue;

                var left = 0, right = 0;

                // Check how many columns to my left have same or more height as me
                for(var k=j-1;k>=0;k--) {
                    if (height[k]<height[j]) break;
                    left++;
                }

                // Check how many columns to my right have same or more height as me
                for(var k=j+1;k<col_nums;k++) {
                    if (height[k]<height[j]) break;
                    right++;
                }

                area = height[j]*(1+left+right);
                if (area > max_area && (!isSquare || height[j] == 1+left+right)) {
                    W = 1+left+right;
                    H = height[j];
                    L = j - left;
                    T = i-height[j]+1;
                    max_area = area;
                }
            }
        }

        return {area: max_area, left: L, top: T, width: W, height: H};
    }
    
// var createRect = (a, b, c = 2) => {
//     var res = [];
//     for(var j=0; j<b; j++){
//         res.push([]);
//         for(var i=0; i<a; i++){
//             res[j].push(Math.floor(Math.random() * c));
//         }
//     }
//     return res;
// }
// var rc = createRect(200, 300);
// var rc = [
//     [1,1,1,0,1,1,1,1,1],
//     [1,1,1,0,1,1,1,1,1],
//     [1,1,0,0,1,1,1,0,0],
//     [0,0,1,0,1,0,1,1,1],
//     [0,1,1,0,0,1,0,1,0],
//     [1,1,1,0,1,0,0,1,0],
//     [1,1,1,1,1,1,0,1,1],
// ];

    // findContinue([
    //     [1,1,3,3,5,4,8,9,2],
    //     [1,2,5,5,5,4,7,5,5],
    //     [1,2,3,3,5,1,2,3,4],
    //     [9,8,5,5,6,2,1,1,1],
    //     [6,6,5,8,7,7,7,4,1],
    //     [6,5,5,8,5,6,7,4,2],
    //     [3,3,3,3,4,3,7,1,5],
    // ], 5);

    export default {
        findContinue,
        findRect
    }

    // maximum sum subarray
    function mss(arr){
        if(nums.length == 0) return 0;
        var res = -Infinity, s = 0;
        for(var i=0; i<nums.length; i++){
            s += nums[i];
            res = Math.max(res, s);
            if(s < 0) s = 0;
        }
        return res;
    }

    /*
import os
def listFile(route):
    res = {
        'files': os.listdir(route),
        'dirNum': 0,
    }
    dirNum = 0;
    def func(x):
        return list(os.path.splitext(x)[::-1])[0] + ('' if os.path.isdir(x) else '.')
    res['files'].sort(key = func)
    while os.path.isdir(res['files'][res['dirNum']]):
        res['dirNum'] += 1
    return res

print(listFile('.'))
    */
</script>
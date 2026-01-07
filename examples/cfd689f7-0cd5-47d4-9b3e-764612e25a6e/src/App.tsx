import React, { useState, useEffect } from 'react';
import { Search, Car, History, Star, Zap, X } from 'lucide-react';

// 车牌归属地和城市区号数据
const plateData = {
  '京': {
    province: '北京市',
    areas: {
      'A': '警察部门',
      'B': '东城区',
      'C': '西城区',
      'D': '朝阳区',
      'E': '海淀区',
      'F': '丰台区',
      'G': '石景山区',
      'H': '门头沟区',
      'J': '房山区',
      'K': '通州区',
      'L': '顺义区',
      'M': '昌平区',
      'N': '大兴区',
      'P': '平谷区',
      'Q': '怀柔区',
      'R': '延庆区',
      'Y': '应急车辆'
    }
  },
  '津': {
    province: '天津市',
    areas: {
      'A': '市区',
      'B': '市区',
      'C': '市区',
      'D': '市区',
      'E': '滨海新区',
      'F': '东丽区',
      'G': '西青区',
      'H': '津南区',
      'J': '北辰区',
      'K': '武清区',
      'L': '宝坻区',
      'M': '静海区',
      'N': '宁河区'
    }
  },
  '沪': {
    province: '上海市',
    areas: {
      'A': '黄浦区',
      'B': '徐汇区',
      'C': '长宁区',
      'D': '静安区',
      'E': '普陀区',
      'F': '虹口区',
      'G': '杨浦区',
      'H': '闵行区',
      'J': '宝山区',
      'K': '嘉定区',
      'L': '浦东新区',
      'M': '青浦区',
      'N': '松江区',
      'P': '金山区',
      'Q': '奉贤区',
      'R': '崇明区'
    }
  },
  '渝': {
    province: '重庆市',
    areas: {
      'A': '主城区',
      'B': '江北区',
      'C': '渝中区',
      'D': '大渡口区',
      'F': '南岸区',
      'G': '北碚区',
      'H': '渝北区',
      'J': '巴南区',
      'K': '长寿区',
      'L': '江津区',
      'M': '永川区',
      'N': '涪陵区',
      'P': '合川区',
      'Q': '黔江区',
      'R': '万州区'
    }
  },
  '冀': {
    province: '河北省',
    areas: {
      'A': '石家庄',
      'B': '唐山',
      'C': '秦皇岛',
      'D': '邯郸',
      'E': '邢台',
      'F': '保定',
      'G': '张家口',
      'H': '承德',
      'J': '沧州',
      'K': '廊坊',
      'L': '衡水',
      'M': '省直机关',
      'N': '雄安新区'
    }
  },
  '豫': {
    province: '河南省',
    areas: {
      'A': '郑州',
      'B': '开封',
      'C': '洛阳',
      'D': '平顶山',
      'E': '安阳',
      'F': '鹤壁',
      'G': '新乡',
      'H': '焦作',
      'J': '濮阳',
      'K': '许昌',
      'L': '漯河',
      'M': '三门峡',
      'N': '商丘',
      'P': '周口',
      'Q': '驻马店',
      'R': '南阳',
      'S': '信阳',
      'U': '济源'
    }
  },
  '云': {
    province: '云南省',
    areas: {
      'A': '昆明',
      'B': '东川',
      'C': '昭通',
      'D': '曲靖',
      'E': '楚雄',
      'F': '玉溪',
      'G': '红河',
      'H': '文山',
      'J': '思茅',
      'K': '西双版纳',
      'L': '大理',
      'M': '保山',
      'N': '德宏',
      'P': '丽江',
      'Q': '怒江',
      'R': '迪庆',
      'S': '临沧'
    }
  },
  '辽': {
    province: '辽宁省',
    areas: {
      'A': '沈阳',
      'B': '大连',
      'C': '鞍山',
      'D': '抚顺',
      'E': '本溪',
      'F': '丹东',
      'G': '锦州',
      'H': '营口',
      'J': '阜新',
      'K': '辽阳',
      'L': '盘锦',
      'M': '铁岭',
      'N': '朝阳',
      'P': '葫芦岛'
    }
  },
  '黑': {
    province: '黑龙江省',
    areas: {
      'A': '哈尔滨',
      'B': '齐齐哈尔',
      'C': '牡丹江',
      'D': '佳木斯',
      'E': '大庆',
      'F': '伊春',
      'G': '鸡西',
      'H': '鹤岗',
      'J': '双鸭山',
      'K': '七台河',
      'L': '松花江',
      'M': '绥化',
      'N': '黑河',
      'P': '大兴安岭'
    }
  },
  '湘': {
    province: '湖南省',
    areas: {
      'A': '长沙',
      'B': '株洲',
      'C': '湘潭',
      'D': '衡阳',
      'E': '邵阳',
      'F': '岳阳',
      'G': '张家界',
      'H': '益阳',
      'J': '常德',
      'K': '娄底',
      'L': '郴州',
      'M': '永州',
      'N': '怀化',
      'P': '湘西'
    }
  },
  '皖': {
    province: '安徽省',
    areas: {
      'A': '合肥',
      'B': '芜湖',
      'C': '蚌埠',
      'D': '淮南',
      'E': '马鞍山',
      'F': '淮北',
      'G': '铜陵',
      'H': '安庆',
      'J': '黄山',
      'K': '阜阳',
      'L': '宿州',
      'M': '滁州',
      'N': '六安',
      'P': '宣城',
      'Q': '巢湖',
      'R': '池州',
      'S': '亳州'
    }
  },
  '鲁': {
    province: '山东省',
    areas: {
      'A': '济南',
      'B': '青岛',
      'C': '淄博',
      'D': '枣庄',
      'E': '东营',
      'F': '烟台',
      'G': '潍坊',
      'H': '济宁',
      'J': '泰安',
      'K': '威海',
      'L': '日照',
      'M': '滨州',
      'N': '德州',
      'P': '聊城',
      'Q': '临沂',
      'R': '菏泽',
      'S': '莱芜'
    }
  },
  '新': {
    province: '新疆维吾尔自治区',
    areas: {
      'A': '乌鲁木齐',
      'B': '昌吉',
      'C': '石河子',
      'D': '奎屯',
      'E': '博尔塔拉',
      'F': '伊犁',
      'G': '塔城',
      'H': '阿勒泰',
      'J': '克拉玛依',
      'K': '吐鲁番',
      'L': '哈密',
      'M': '巴音郭楞',
      'N': '阿克苏',
      'P': '克孜勒苏',
      'Q': '喀什',
      'R': '和田'
    }
  },
  '苏': {
    province: '江苏省',
    areas: {
      'A': '南京',
      'B': '无锡',
      'C': '徐州',
      'D': '常州',
      'E': '苏州',
      'F': '南通',
      'G': '连云港',
      'H': '淮安',
      'J': '盐城',
      'K': '扬州',
      'L': '镇江',
      'M': '泰州',
      'N': '宿迁'
    }
  },
  '浙': {
    province: '浙江省',
    areas: {
      'A': '杭州',
      'B': '宁波',
      'C': '温州',
      'D': '绍兴',
      'E': '湖州',
      'F': '嘉兴',
      'G': '金华',
      'H': '衢州',
      'J': '台州',
      'K': '丽水',
      'L': '舟山'
    }
  },
  '赣': {
    province: '江西省',
    areas: {
      'A': '南昌',
      'B': '赣州',
      'C': '宜春',
      'D': '吉安',
      'E': '上饶',
      'F': '抚州',
      'G': '九江',
      'H': '景德镇',
      'J': '萍乡',
      'K': '新余',
      'L': '鹰潭'
    }
  },
  '鄂': {
    province: '湖北省',
    areas: {
      'A': '武汉',
      'B': '黄石',
      'C': '十堰',
      'D': '荆州',
      'E': '宜昌',
      'F': '襄阳',
      'G': '鄂州',
      'H': '荆门',
      'J': '黄冈',
      'K': '孝感',
      'L': '咸宁',
      'M': '仙桃',
      'N': '潜江',
      'P': '神农架',
      'Q': '恩施',
      'R': '天门'
    }
  },
  '桂': {
    province: '广西壮族自治区',
    areas: {
      'A': '南宁',
      'B': '柳州',
      'C': '桂林',
      'D': '梧州',
      'E': '北海',
      'F': '崇左',
      'G': '来宾',
      'H': '桂平',
      'J': '贵港',
      'K': '玉林',
      'L': '百色',
      'M': '河池',
      'N': '钦州',
      'P': '防城港',
      'R': '贺州'
    }
  },
  '甘': {
    province: '甘肃省',
    areas: {
      'A': '兰州',
      'B': '嘉峪关',
      'C': '金昌',
      'D': '白银',
      'E': '天水',
      'F': '酒泉',
      'G': '张掖',
      'H': '武威',
      'J': '定西',
      'K': '陇南',
      'L': '平凉',
      'M': '庆阳',
      'N': '临夏',
      'P': '甘南'
    }
  },
  '晋': {
    province: '山西省',
    areas: {
      'A': '太原',
      'B': '大同',
      'C': '阳泉',
      'D': '长治',
      'E': '晋城',
      'F': '朔州',
      'H': '忻州',
      'J': '吕梁',
      'K': '晋中',
      'L': '临汾',
      'M': '运城'
    }
  },
  '蒙': {
    province: '内蒙古自治区',
    areas: {
      'A': '呼和浩特',
      'B': '包头',
      'C': '乌海',
      'D': '赤峰',
      'E': '呼伦贝尔',
      'F': '兴安盟',
      'G': '通辽',
      'H': '锡林郭勒盟',
      'J': '乌兰察布',
      'K': '鄂尔多斯',
      'L': '巴彦淖尔',
      'M': '阿拉善盟'
    }
  },
  '陕': {
    province: '陕西省',
    areas: {
      'A': '西安',
      'B': '铜川',
      'C': '宝鸡',
      'D': '咸阳',
      'E': '渭南',
      'F': '汉中',
      'G': '安康',
      'H': '商洛',
      'J': '延安',
      'K': '榆林',
      'V': '杨凌'
    }
  },
  '吉': {
    province: '吉林省',
    areas: {
      'A': '长春',
      'B': '吉林市',
      'C': '四平',
      'D': '辽源',
      'E': '通化',
      'F': '白山',
      'G': '白城',
      'H': '延边',
      'J': '松原'
    }
  },
  '闽': {
    province: '福建省',
    areas: {
      'A': '福州',
      'B': '莆田',
      'C': '泉州',
      'D': '厦门',
      'E': '漳州',
      'F': '龙岩',
      'G': '三明',
      'H': '南平',
      'J': '宁德'
    }
  },
  '贵': {
    province: '贵州省',
    areas: {
      'A': '贵阳',
      'B': '六盘水',
      'C': '遵义',
      'D': '铜仁',
      'E': '黔西南',
      'F': '毕节',
      'G': '安顺',
      'H': '黔东南',
      'J': '黔南'
    }
  },
  '粤': {
    province: '广东省',
    areas: {
      'A': '广州',
      'B': '深圳',
      'C': '珠海',
      'D': '汕头',
      'E': '佛山',
      'F': '韶关',
      'G': '湛江',
      'H': '肇庆',
      'J': '江门',
      'K': '茂名',
      'L': '惠州',
      'M': '梅州',
      'N': '汕尾',
      'P': '河源',
      'Q': '阳江',
      'R': '清远',
      'S': '东莞',
      'T': '中山',
      'U': '潮州',
      'V': '揭阳',
      'W': '云浮',
      'X': '顺德',
      'Y': '南海',
      'Z': '港澳'
    }
  },
  '青': {
    province: '青海省',
    areas: {
      'A': '西宁',
      'B': '海东',
      'C': '海北',
      'D': '黄南',
      'E': '海南',
      'F': '果洛',
      'G': '玉树',
      'H': '海西'
    }
  },
  '藏': {
    province: '西藏自治区',
    areas: {
      'A': '拉萨',
      'B': '昌都',
      'C': '山南',
      'D': '日喀则',
      'E': '那曲',
      'F': '阿里',
      'G': '林芝'
    }
  },
  '川': {
    province: '四川省',
    areas: {
      'A': '成都',
      'B': '绵阳',
      'C': '自贡',
      'D': '攀枝花',
      'E': '泸州',
      'F': '德阳',
      'G': '广元',
      'H': '遂宁',
      'J': '内江',
      'K': '乐山',
      'L': '资阳',
      'M': '宜宾',
      'N': '南充',
      'P': '达州',
      'Q': '雅安',
      'R': '阿坝',
      'S': '甘孜',
      'T': '凉山',
      'U': '广安',
      'V': '巴中',
      'W': '眉山'
    }
  },
  '宁': {
    province: '宁夏回族自治区',
    areas: {
      'A': '银川',
      'B': '石嘴山',
      'C': '吴忠',
      'D': '固原',
      'E': '中卫'
    }
  },
  '琼': {
    province: '海南省',
    areas: {
      'A': '海口',
      'B': '三亚',
      'C': '琼海',
      'D': '儋州',
      'E': '文昌',
      'F': '万宁',
      'G': '东方',
      'H': '定安',
      'J': '屯昌',
      'K': '澄迈',
      'L': '临高',
      'M': '白沙',
      'N': '昌江',
      'P': '乐东',
      'Q': '陵水',
      'R': '保亭',
      'S': '琼中'
    }
  },
  '使': {
    province: '使馆车牌',
    areas: {
      'A': '使馆车辆',
      'B': '使馆车辆',
      'C': '使馆车辆',
      'D': '使馆车辆'
    }
  },
  '领': {
    province: '领事馆车牌',
    areas: {
      'A': '领事馆车辆',
      'B': '领事馆车辆',
      'C': '领事馆车辆',
      'D': '领事馆车辆'
    }
  }
};

// 新能源车牌规则
const isNewEnergyPlate = (plate: string) => {
  return /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领][A-Z][DF][A-HJ-NP-Z0-9]{4}$/.test(plate);
};

// 普通车牌规则
const isRegularPlate = (plate: string) => {
  return /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领][A-Z][A-HJ-NP-Z0-9]{4}[A-HJ-NP-Z0-9挂学警港澳]$/.test(plate);
};

function App() {
  const [plateNumber, setPlateNumber] = useState('');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const savedHistory = localStorage.getItem('plateHistory');
    const savedFavorites = localStorage.getItem('plateFavorites');
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
  }, []);

  const saveToHistory = (plate: string) => {
    const newHistory = [plate, ...history.filter(p => p !== plate)].slice(0, 10);
    setHistory(newHistory);
    localStorage.setItem('plateHistory', JSON.stringify(newHistory));
  };

  const toggleFavorite = (plate: string) => {
    const newFavorites = favorites.includes(plate)
      ? favorites.filter(p => p !== plate)
      : [...favorites, plate].slice(0, 5);
    setFavorites(newFavorites);
    localStorage.setItem('plateFavorites', JSON.stringify(newFavorites));
  };

  const handleSearch = () => {
    if (!plateNumber) {
      setError('请输入车牌号');
      setResult(null);
      return;
    }

    if (!isRegularPlate(plateNumber) && !isNewEnergyPlate(plateNumber)) {
      setError('车牌格式不正确');
      setResult(null);
      return;
    }

    const province = plateNumber.charAt(0);
    const area = plateNumber.charAt(1);
    const provinceData = plateData[province as keyof typeof plateData];

    if (provinceData) {
      const isNewEnergy = isNewEnergyPlate(plateNumber);
      setResult({
        province: provinceData.province,
        area: provinceData.areas?.[area] || '未知区域',
        isNewEnergy
      });
      setError(null);
      saveToHistory(plateNumber);
    } else {
      setError('未找到对应的归属地信息');
      setResult(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="flex items-center justify-center mb-6">
          <Car className="w-10 h-10 text-indigo-600 mr-2" />
          <h1 className="text-2xl font-bold text-gray-800">车牌归属地查询</h1>
        </div>

        <div className="relative mb-6">
          <input
            type="text"
            value={plateNumber}
            onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
            onKeyPress={handleKeyPress}
            placeholder="请输入车牌号，如：京A12345"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-colors"
            maxLength={8}
          />
          <button
            onClick={handleSearch}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-indigo-600 transition-colors"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>

        {/* 快速查询按钮 */}
        <div className="flex space-x-2 mb-4">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center px-3 py-1 text-sm bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
          >
            <History className="w-4 h-4 mr-1" />
            历史记录
          </button>
          {favorites.length > 0 && (
            <button
              className="flex items-center px-3 py-1 text-sm bg-yellow-50 text-yellow-600 rounded-full hover:bg-yellow-100 transition-colors"
            >
              <Star className="w-4 h-4 mr-1" />
              收藏
            </button>
          )}
          <button
            className="flex items-center px-3 py-1 text-sm bg-green-50 text-green-600 rounded-full hover:bg-green-100 transition-colors"
          >
            <Zap className="w-4 h-4 mr-1" />
            新能源
          </button>
        </div>

        {/* 历史记录面板 */}
        {showHistory && history.length > 0 && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-semibold text-gray-600">最近查询</h3>
              <button
                onClick={() => setShowHistory(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-1">
              {history.map((plate, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-2 hover:bg-gray-100 rounded"
                >
                  <button
                    onClick={() => {
                      setPlateNumber(plate);
                      handleSearch();
                    }}
                    className="text-gray-600 hover:text-indigo-600"
                  >
                    {plate}
                  </button>
                  <button
                    onClick={() => toggleFavorite(plate)}
                    className={`${
                      favorites.includes(plate)
                        ? 'text-yellow-500'
                        : 'text-gray-400'
                    } hover:text-yellow-600`}
                  >
                    <Star className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">
            {error}
          </div>
        )}

        {result && (
          <div className="bg-indigo-50 p-6 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">查询结果</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
                <span className="text-2xl font-bold text-indigo-600">
                  {plateNumber}
                </span>
                <button
                  onClick={() => toggleFavorite(plateNumber)}
                  className={`${
                    favorites.includes(plateNumber)
                      ? 'text-yellow-500'
                      : 'text-gray-400'
                  } hover:text-yellow-600`}
                >
                  <Star className="w-6 h-6" />
                </button>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">省份：</span>
                  <span className="font-medium">{result.province}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">区域：</span>
                  <span className="font-medium">{result.area}</span>
                </div>
                {result.isNewEnergy && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">车型：</span>
                    <span className="flex items-center text-green-600">
                      <Zap className="w-4 h-4 mr-1" />
                      新能源车辆
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 text-sm text-gray-500 space-y-1">
          <p>提示：</p>
          <ul className className="list-disc list-inside space-y-1">
            <li>支持普通车牌和新能源车牌查询</li>
            <li>可以收藏常用车牌（最多5个）</li>
            <li>自动保存最近10次查询记录</li>
            <li>按回车键快速查询</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;
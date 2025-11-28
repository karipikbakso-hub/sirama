<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class RegionController extends Controller
{
    /**
     * Get all provinces.
     */
    public function getProvinces(): JsonResponse
    {
        try {
            // For now, return mock data. In production, this should come from a regions table
            $provinces = [
                ['id' => '11', 'nama' => 'ACEH'],
                ['id' => '12', 'nama' => 'SUMATERA UTARA'],
                ['id' => '13', 'nama' => 'SUMATERA BARAT'],
                ['id' => '14', 'nama' => 'RIAU'],
                ['id' => '15', 'nama' => 'JAMBI'],
                ['id' => '16', 'nama' => 'SUMATERA SELATAN'],
                ['id' => '17', 'nama' => 'BENGKULU'],
                ['id' => '18', 'nama' => 'LAMPUNG'],
                ['id' => '19', 'nama' => 'KEPULAUAN BANGKA BELITUNG'],
                ['id' => '21', 'nama' => 'KEPULAUAN RIAU'],
                ['id' => '31', 'nama' => 'DKI JAKARTA'],
                ['id' => '32', 'nama' => 'JAWA BARAT'],
                ['id' => '33', 'nama' => 'JAWA TENGAH'],
                ['id' => '34', 'nama' => 'DI YOGYAKARTA'],
                ['id' => '35', 'nama' => 'JAWA TIMUR'],
                ['id' => '36', 'nama' => 'BANTEN'],
                ['id' => '51', 'nama' => 'BALI'],
                ['id' => '52', 'nama' => 'NUSA TENGGARA BARAT'],
                ['id' => '53', 'nama' => 'NUSA TENGGARA TIMUR'],
                ['id' => '61', 'nama' => 'KALIMANTAN BARAT'],
                ['id' => '62', 'nama' => 'KALIMANTAN TENGAH'],
                ['id' => '63', 'nama' => 'KALIMANTAN SELATAN'],
                ['id' => '64', 'nama' => 'KALIMANTAN TIMUR'],
                ['id' => '65', 'nama' => 'KALIMANTAN UTARA'],
                ['id' => '71', 'nama' => 'SULAWESI UTARA'],
                ['id' => '72', 'nama' => 'SULAWESI TENGAH'],
                ['id' => '73', 'nama' => 'SULAWESI SELATAN'],
                ['id' => '74', 'nama' => 'SULAWESI TENGGARA'],
                ['id' => '75', 'nama' => 'GORONTALO'],
                ['id' => '76', 'nama' => 'SULAWESI BARAT'],
                ['id' => '81', 'nama' => 'MALUKU'],
                ['id' => '82', 'nama' => 'MALUKU UTARA'],
                ['id' => '91', 'nama' => 'PAPUA BARAT'],
                ['id' => '92', 'nama' => 'PAPUA'],
            ];

            return response()->json([
                'success' => true,
                'data' => $provinces
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve provinces',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get cities by province ID.
     */
    public function getCities(string $provinceId): JsonResponse
    {
        try {
            // Mock data for cities. In production, filter by province_id
            $cities = [
                ['id' => '1101', 'nama' => 'KABUPATEN SIMEULUE'],
                ['id' => '1102', 'nama' => 'KABUPATEN ACEH SINGKIL'],
                ['id' => '1103', 'nama' => 'KABUPATEN ACEH SELATAN'],
                ['id' => '1104', 'nama' => 'KABUPATEN ACEH TENGGARA'],
                ['id' => '1105', 'nama' => 'KABUPATEN ACEH TIMUR'],
                ['id' => '1106', 'nama' => 'KABUPATEN ACEH TENGAH'],
                ['id' => '1107', 'nama' => 'KABUPATEN ACEH BARAT'],
                ['id' => '1108', 'nama' => 'KABUPATEN ACEH BESAR'],
                ['id' => '1109', 'nama' => 'KABUPATEN PIDIE'],
                ['id' => '1110', 'nama' => 'KABUPATEN BIREUEN'],
                ['id' => '1111', 'nama' => 'KABUPATEN ACEH UTARA'],
                ['id' => '1112', 'nama' => 'KABUPATEN ACEH BARAT DAYA'],
                ['id' => '1113', 'nama' => 'KABUPATEN GAYO LUES'],
                ['id' => '1114', 'nama' => 'KABUPATEN ACEH TAMIANG'],
                ['id' => '1115', 'nama' => 'KABUPATEN NAGAN RAYA'],
                ['id' => '1116', 'nama' => 'KABUPATEN ACEH JAYA'],
                ['id' => '1117', 'nama' => 'KABUPATEN BENER MERIAH'],
                ['id' => '1118', 'nama' => 'KABUPATEN PIDIE JAYA'],
                ['id' => '1171', 'nama' => 'KOTA BANDA ACEH'],
                ['id' => '1172', 'nama' => 'KOTA SABANG'],
                ['id' => '1173', 'nama' => 'KOTA LANGSA'],
                ['id' => '1174', 'nama' => 'KOTA LHOKSEUMAWE'],
                ['id' => '1175', 'nama' => 'KOTA SUBULUSSALAM'],
                // Add more cities as needed...
                ['id' => '3171', 'nama' => 'KOTA JAKARTA SELATAN'],
                ['id' => '3172', 'nama' => 'KOTA JAKARTA TIMUR'],
                ['id' => '3173', 'nama' => 'KOTA JAKARTA PUSAT'],
                ['id' => '3174', 'nama' => 'KOTA JAKARTA BARAT'],
                ['id' => '3175', 'nama' => 'KOTA JAKARTA UTARA'],
                ['id' => '3273', 'nama' => 'KOTA BANDUNG'],
                ['id' => '3274', 'nama' => 'KOTA CIREBON'],
                ['id' => '3275', 'nama' => 'KOTA BEKASI'],
                ['id' => '3276', 'nama' => 'KOTA DEPOK'],
                ['id' => '3277', 'nama' => 'KOTA CIMAHI'],
                ['id' => '3278', 'nama' => 'KOTA TASIKMALAYA'],
                ['id' => '3279', 'nama' => 'KOTA BANJAR'],
                ['id' => '3373', 'nama' => 'KOTA SEMARANG'],
                ['id' => '3374', 'nama' => 'KOTA PEKALONGAN'],
                ['id' => '3375', 'nama' => 'KOTA TEGAL'],
                ['id' => '3376', 'nama' => 'KOTA MAGELANG'],
                ['id' => '3471', 'nama' => 'KOTA YOGYAKARTA'],
                ['id' => '3573', 'nama' => 'KOTA MALANG'],
                ['id' => '3574', 'nama' => 'KOTA Batu'],
                ['id' => '3575', 'nama' => 'KOTA MOJOKERTO'],
                ['id' => '3576', 'nama' => 'KOTA PASURUAN'],
                ['id' => '3577', 'nama' => 'KOTA PROBOLINGGO'],
                ['id' => '3578', 'nama' => 'KOTA SURABAYA'],
                ['id' => '3579', 'nama' => 'KOTA BATU'],
                ['id' => '5171', 'nama' => 'KOTA DENPASAR'],
            ];

            // Filter cities by province (first 2 digits of city code match province id)
            $filteredCities = array_filter($cities, function ($city) use ($provinceId) {
                return substr($city['id'], 0, 2) === $provinceId;
            });

            return response()->json([
                'success' => true,
                'data' => array_values($filteredCities)
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve cities',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get districts by city ID.
     */
    public function getDistricts(string $cityId): JsonResponse
    {
        try {
            // Mock data for districts. In production, filter by city_id
            $districts = [
                ['id' => '110101', 'nama' => 'TEUPAH SELATAN'],
                ['id' => '110102', 'nama' => 'SIMEULUE TIMUR'],
                ['id' => '110103', 'nama' => 'TEUPAH BARAT'],
                ['id' => '110104', 'nama' => 'TEUPAH TENGAH'],
                ['id' => '110105', 'nama' => 'SIMEULUE TENGAH'],
                ['id' => '110106', 'nama' => 'TELUK DALAM'],
                ['id' => '110107', 'nama' => 'SIMEULUE CUT'],
                ['id' => '110108', 'nama' => 'SALANG'],
                ['id' => '110109', 'nama' => 'SIMEULUE BARAT'],
                ['id' => '110110', 'nama' => 'ALAFAN'],
                // Add more districts...
                ['id' => '317101', 'nama' => 'TEBET'],
                ['id' => '317102', 'nama' => 'SETIA BUDI'],
                ['id' => '317103', 'nama' => 'MAMPANG PRAPATAN'],
                ['id' => '317104', 'nama' => 'PASAR MINGGU'],
                ['id' => '317105', 'nama' => 'JAGAKARSA'],
                ['id' => '317106', 'nama' => 'CILANDAK'],
                ['id' => '317107', 'nama' => 'PESANGGRAHAN'],
                ['id' => '317108', 'nama' => 'KEBAYORAN LAMA'],
                ['id' => '317109', 'nama' => 'KEBAYORAN BARU'],
                ['id' => '317110', 'nama' => 'PANCORAN'],
                ['id' => '327301', 'nama' => 'SUKASARI'],
                ['id' => '327302', 'nama' => 'COBLONG'],
                ['id' => '327303', 'nama' => 'BABAKAN CIPARAY'],
                ['id' => '327304', 'nama' => 'BOJONGLOA KALER'],
                ['id' => '327305', 'nama' => 'ANDIR'],
                ['id' => '327306', 'nama' => 'CICENDO'],
                ['id' => '327307', 'nama' => 'SUKAJADI'],
                ['id' => '327308', 'nama' => 'CIDADAP'],
                ['id' => '327309', 'nama' => 'BANDUNG WETAN'],
                ['id' => '327310', 'nama' => 'ASTANAANYAR'],
                ['id' => '327311', 'nama' => 'REGOL'],
                ['id' => '327312', 'nama' => 'BATUNUNGGAL'],
                ['id' => '327313', 'nama' => 'LENGKONG'],
                ['id' => '327314', 'nama' => 'CIBEUNYING KIDUL'],
                ['id' => '327315', 'nama' => 'CIBEUNYING KALER'],
                ['id' => '327316', 'nama' => 'SUMUR BANDUNG'],
                ['id' => '327317', 'nama' => 'ANTAPANI'],
                ['id' => '327318', 'nama' => 'BANDUNG KULON'],
                ['id' => '327319', 'nama' => 'CIRENDEU'],
                ['id' => '327320', 'nama' => 'CINAMBO'],
                ['id' => '327321', 'nama' => 'CIWIDEY'],
                ['id' => '327322', 'nama' => 'DAYEUHKOLOT'],
                ['id' => '327323', 'nama' => 'MARGALUYU'],
                ['id' => '327324', 'nama' => 'MARGAHAYU'],
                ['id' => '327325', 'nama' => 'MARGAASIH'],
                ['id' => '327326', 'nama' => 'BUAHBATU'],
                ['id' => '327327', 'nama' => 'KERTASARI'],
                ['id' => '327328', 'nama' => 'PANGALENGAN'],
                ['id' => '327329', 'nama' => 'SOLEAR'],
                ['id' => '327330', 'nama' => 'NGAMPRAH'],
                ['id' => '327331', 'nama' => 'CIPATAT'],
                ['id' => '327332', 'nama' => 'PADALARANG'],
                ['id' => '327333', 'nama' => 'BATUJAJAR'],
                ['id' => '327334', 'nama' => 'CIHAMPELAS'],
                ['id' => '327335', 'nama' => 'CILILIN'],
                ['id' => '327336', 'nama' => 'CIPONGKOR'],
                ['id' => '327337', 'nama' => 'RANCABALI'],
                ['id' => '327338', 'nama' => 'PARONGPONG'],
                ['id' => '327339', 'nama' => 'KATAPANG'],
                ['id' => '327340', 'nama' => 'SOREANG'],
                ['id' => '327341', 'nama' => 'PASIRJAMBU'],
                ['id' => '327342', 'nama' => 'CIPEUNDEUY'],
                ['id' => '327343', 'nama' => 'BANJARAN'],
                ['id' => '327344', 'nama' => 'CIMAUNG'],
                ['id' => '327345', 'nama' => 'PAMEUNGPEUK'],
                ['id' => '327346', 'nama' => 'PANGALENGAN'],
                ['id' => '327347', 'nama' => 'KERTASARI'],
                ['id' => '327348', 'nama' => 'PACET'],
                ['id' => '327349', 'nama' => 'IBUN'],
                ['id' => '327350', 'nama' => 'PASEH'],
                ['id' => '327351', 'nama' => 'CIKANCUNG'],
                ['id' => '327352', 'nama' => 'CICALENGKA'],
                ['id' => '327353', 'nama' => 'NAGREG'],
                ['id' => '327354', 'nama' => 'RANCAEKEK'],
                ['id' => '327355', 'nama' => 'MAJALAYA'],
                ['id' => '327356', 'nama' => 'SOLOKAN JERUK'],
                ['id' => '327357', 'nama' => 'CIPARAY'],
                ['id' => '327358', 'nama' => 'BALEENDAH'],
                ['id' => '327359', 'nama' => 'ARJASARI'],
                ['id' => '327360', 'nama' => 'BANJARAN'],
            ];

            // Filter districts by city (first 4 digits of district code match city id)
            $filteredDistricts = array_filter($districts, function ($district) use ($cityId) {
                return substr($district['id'], 0, 4) === $cityId;
            });

            return response()->json([
                'success' => true,
                'data' => array_values($filteredDistricts)
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve districts',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get villages by district ID.
     */
    public function getVillages(string $districtId): JsonResponse
    {
        try {
            // Mock data for villages. In production, filter by district_id
            $villages = [
                ['id' => '3171011001', 'nama' => 'TEBET BARAT'],
                ['id' => '3171011002', 'nama' => 'TEBET TIMUR'],
                ['id' => '3171011003', 'nama' => 'KEBON BARU'],
                ['id' => '3171011004', 'nama' => 'BUKIT DURI'],
                ['id' => '3171011005', 'nama' => 'MANGGARAI'],
                ['id' => '3171011006', 'nama' => 'MANGGARAI SELATAN'],
                // Add more villages...
                ['id' => '3273011001', 'nama' => 'SUKASARI'],
                ['id' => '3273011002', 'nama' => 'SUKALUYU'],
                ['id' => '3273011003', 'nama' => 'CIBADUYUT'],
                ['id' => '3273011004', 'nama' => 'CICAHEUM'],
                ['id' => '3273011005', 'nama' => 'SUKAMISKIN'],
                ['id' => '3273011006', 'nama' => 'ARCAMANIK'],
                ['id' => '3273011007', 'nama' => 'PALASARI'],
                ['id' => '3273011008', 'nama' => 'SARIJADI'],
                ['id' => '3273011009', 'nama' => 'SUKAMAJU'],
                ['id' => '3273011010', 'nama' => 'CIJAWURA'],
            ];

            // Filter villages by district (first 7 digits of village code match district id)
            $filteredVillages = array_filter($villages, function ($village) use ($districtId) {
                return substr($village['id'], 0, 7) === $districtId;
            });

            return response()->json([
                'success' => true,
                'data' => array_values($filteredVillages)
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve villages',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
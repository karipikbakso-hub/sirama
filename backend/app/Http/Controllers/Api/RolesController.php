<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;

class RolesController extends Controller
{
    /**
     * Display a listing of the core roles.
     */
    public function index()
    {
        $coreRoles = [
            'admin',
            'pendaftaran',
            'dokter',
            'perawat',
            'apoteker',
            'kasir',
            'manajemenrs'
        ];

        return response()->json($coreRoles);
    }
}

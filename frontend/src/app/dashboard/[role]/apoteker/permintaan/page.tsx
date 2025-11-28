'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Eye, Check, X, Send, ShoppingCart } from 'lucide-react'
import { useFetch, usePost } from '@/hooks/useApi'
import toast from '@/lib/toast'
import api from '@/lib/api'

interface PurchaseRequisition {
  id: number
  pr_number: string
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'converted_to_po'
  total_items: number
  total_quantity: number
  notes?: string
  created_at: string
  creator: {
    id: number
    name: string
  }
  approver?: {
    id: number
    name: string
  }
  items: PurchaseRequisitionItem[]
}

interface PurchaseRequisitionItem {
  id: number
  medicine: {
    id: number
    nama_obat: string
    satuan: string
  }
  quantity_requested: number
  quantity_approved?: number
  unit_price?: number
  notes?: string
}

interface MedicineNeedReorder {
  id: number
  name: string
  generic_name: string
  current_stock: number
  reorder_point: number
  suggested_quantity: number
  unit: string
}

export default function PermintaanObatPage() {
  const params = useParams()
  const role = params?.role as string

  const [purchaseRequisitions, setPurchaseRequisitions] = useState<PurchaseRequisition[]>([])
  const [medicinesNeedReorder, setMedicinesNeedReorder] = useState<MedicineNeedReorder[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPR, setSelectedPR] = useState<PurchaseRequisition | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showApprovalDialog, setShowApprovalDialog] = useState(false)
  const [selectedItems, setSelectedItems] = useState<any[]>([])
  const [notes, setNotes] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [activeTab, setActiveTab] = useState('select-medicines')

  // Load data
  useEffect(() => {
    loadPurchaseRequisitions()
    loadMedicinesNeedReorder()
  }, [])

  const loadPurchaseRequisitions = async () => {
    try {
      const response = await api.get('/api/purchase-requisitions')
      if (response.data.success) {
        setPurchaseRequisitions(response.data.data.data)
      }
    } catch (error) {
      toast.error('Failed to load purchase requisitions')
    }
  }

  const loadMedicinesNeedReorder = async () => {
    try {
      const response = await api.get('/api/medicines/need-reorder')
      if (response.data.success) {
        // Convert object to array since API returns object with numeric keys
        const medicinesArray = Object.values(response.data.data) as MedicineNeedReorder[]
        setMedicinesNeedReorder(medicinesArray)
      }
    } catch (error) {
      console.error('Failed to load medicines that need reorder:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePR = async () => {
    if (selectedItems.length === 0) {
      toast.error('Please select at least one medicine')
      return
    }

    try {
      const items = selectedItems.map(item => ({
        medicine_id: item.medicine_id,
        quantity_requested: item.quantity,
        notes: item.notes || ''
      }))

      const response = await api.post('/api/purchase-requisitions', {
        items,
        notes
      })

      if (response.data.success) {
        toast.success('Purchase requisition created successfully')
        setShowCreateDialog(false)
        setSelectedItems([])
        setNotes('')
        loadPurchaseRequisitions()
      }
    } catch (error) {
      toast.error('Failed to create purchase requisition')
    }
  }

  const handleSubmitPR = async (prId: number) => {
    try {
      const response = await api.post(`/api/purchase-requisitions/${prId}/submit`)
      if (response.data.success) {
        toast.success('Purchase requisition submitted for approval')
        loadPurchaseRequisitions()
      }
    } catch (error) {
      toast.error('Failed to submit purchase requisition')
    }
  }

  const handleApprovePR = async () => {
    if (!selectedPR) return

    try {
      const approvedQuantities = selectedPR.items.map(item => ({
        item_id: item.id,
        quantity_approved: item.quantity_approved || item.quantity_requested,
        unit_price: 0 // You can add price input in the dialog
      }))

      const response = await api.post(`/api/purchase-requisitions/${selectedPR.id}/approve`, {
        approved_quantities: approvedQuantities
      })

      if (response.data.success) {
        toast.success('Purchase requisition approved successfully')
        setShowApprovalDialog(false)
        setSelectedPR(null)
        loadPurchaseRequisitions()
      }
    } catch (error) {
      toast.error('Failed to approve purchase requisition')
    }
  }

  const handleRejectPR = async () => {
    if (!selectedPR) return

    try {
      const response = await api.post(`/api/purchase-requisitions/${selectedPR.id}/reject`, {
        rejection_reason: rejectionReason
      })

      if (response.data.success) {
        toast.success('Purchase requisition rejected')
        setShowApprovalDialog(false)
        setSelectedPR(null)
        setRejectionReason('')
        loadPurchaseRequisitions()
      }
    } catch (error) {
      toast.error('Failed to reject purchase requisition')
    }
  }

  const handleConvertToPO = async (prId: number) => {
    try {
      const response = await api.post(`/api/purchase-requisitions/${prId}/convert-to-po`)
      if (response.data.success) {
        toast.success('Purchase requisition converted to PO successfully')
        loadPurchaseRequisitions()
      }
    } catch (error) {
      toast.error('Failed to convert purchase requisition to PO')
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "secondary" | "default" | "destructive" | "outline"> = {
      draft: 'secondary',
      pending_approval: 'default',
      approved: 'default',
      rejected: 'destructive',
      converted_to_po: 'default'
    }

    const labels = {
      draft: 'Draft',
      pending_approval: 'Pending Approval',
      approved: 'Approved',
      rejected: 'Rejected',
      converted_to_po: 'Converted to PO'
    }

    return (
      <Badge variant={variants[status] || 'secondary'}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    )
  }

  const addMedicineToSelection = (medicine: MedicineNeedReorder) => {
    if (!selectedItems.find(item => item.medicine_id === medicine.id)) {
      setSelectedItems([...selectedItems, {
        medicine_id: medicine.id,
        name: medicine.name,
        unit: medicine.unit,
        quantity: medicine.suggested_quantity,
        notes: ''
      }])
    }
  }

  const updateSelectedItem = (index: number, field: string, value: any) => {
    const updated = [...selectedItems]
    updated[index][field] = value
    setSelectedItems(updated)
  }

  const removeSelectedItem = (index: number) => {
    setSelectedItems(selectedItems.filter((_, i) => i !== index))
  }

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Permintaan Obat</h1>
          <p className="text-muted-foreground">Kelola purchase requisition untuk obat</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Buat PR Baru
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Buat Purchase Requisition Baru</DialogTitle>
              <DialogDescription>
                Pilih obat yang stoknya rendah dan tentukan quantity yang dibutuhkan
              </DialogDescription>
            </DialogHeader>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="select-medicines">Pilih Obat</TabsTrigger>
                <TabsTrigger value="review-items">Review Items</TabsTrigger>
              </TabsList>

              <TabsContent value="select-medicines" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {medicinesNeedReorder.map((medicine) => (
                    <Card key={medicine.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium">{medicine.name}</h4>
                            <p className="text-sm text-muted-foreground">{medicine.generic_name}</p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => addMedicineToSelection(medicine)}
                            disabled={selectedItems.some(item => item.medicine_id === medicine.id)}
                          >
                            {selectedItems.some(item => item.medicine_id === medicine.id) ? 'Added' : 'Add'}
                          </Button>
                        </div>
                        <div className="text-sm space-y-1">
                          <p>Current Stock: {medicine.current_stock} {medicine.unit}</p>
                          <p>Reorder Point: {medicine.reorder_point} {medicine.unit}</p>
                          <p className="font-medium text-blue-600">
                            Suggested: {medicine.suggested_quantity} {medicine.unit}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="review-items" className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Medicine</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedItems.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateSelectedItem(index, 'quantity', parseInt(e.target.value))}
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell>
                          <Input
                            value={item.notes}
                            onChange={(e) => updateSelectedItem(index, 'notes', e.target.value)}
                            placeholder="Optional notes"
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => removeSelectedItem(index)}
                          >
                            Remove
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Additional notes for this purchase requisition"
                    />
                  </div>
                  <Button onClick={handleCreatePR} disabled={selectedItems.length === 0}>
                    Create Purchase Requisition
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Purchase Requisition</CardTitle>
          <CardDescription>
            Kelola semua purchase requisition yang telah dibuat
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>PR Number</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total Qty</TableHead>
                <TableHead>Creator</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchaseRequisitions.map((pr) => (
                <TableRow key={pr.id}>
                  <TableCell className="font-medium">{pr.pr_number}</TableCell>
                  <TableCell>{getStatusBadge(pr.status)}</TableCell>
                  <TableCell>{pr.total_items}</TableCell>
                  <TableCell>{pr.total_quantity}</TableCell>
                  <TableCell>{pr.creator.name}</TableCell>
                  <TableCell>{new Date(pr.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedPR(pr)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>

                      {pr.status === 'draft' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSubmitPR(pr.id)}
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      )}

                      {pr.status === 'pending_approval' && role === 'kepala_farmasi' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedPR(pr)
                              setShowApprovalDialog(true)
                            }}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRejectPR()}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      )}

                      {pr.status === 'approved' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleConvertToPO(pr.id)}
                        >
                          <ShoppingCart className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Approval Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Approve Purchase Requisition</DialogTitle>
            <DialogDescription>
              Review and approve the quantities for {selectedPR?.pr_number}
            </DialogDescription>
          </DialogHeader>

          {selectedPR && (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Medicine</TableHead>
                    <TableHead>Requested</TableHead>
                    <TableHead>Approved</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedPR.items.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.medicine.nama_obat}</TableCell>
                      <TableCell>{item.quantity_requested}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          defaultValue={item.quantity_requested}
                          onChange={(e) => {
                            const updatedItems = [...selectedPR.items]
                            updatedItems[index].quantity_approved = parseInt(e.target.value)
                            setSelectedPR({...selectedPR, items: updatedItems})
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex gap-2">
                <Button onClick={handleApprovePR}>Approve</Button>
                <Button variant="outline" onClick={() => setShowApprovalDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={!!selectedPR && !showApprovalDialog} onOpenChange={() => setSelectedPR(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Purchase Requisition Details</DialogTitle>
            <DialogDescription>
              {selectedPR?.pr_number} - {getStatusBadge(selectedPR?.status || '')}
            </DialogDescription>
          </DialogHeader>

          {selectedPR && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Creator</Label>
                  <p>{selectedPR.creator.name}</p>
                </div>
                <div>
                  <Label>Created At</Label>
                  <p>{new Date(selectedPR.created_at).toLocaleString()}</p>
                </div>
                {selectedPR.approver && (
                  <div>
                    <Label>Approved By</Label>
                    <p>{selectedPR.approver.name}</p>
                  </div>
                )}
              </div>

              {selectedPR.notes && (
                <div>
                  <Label>Notes</Label>
                  <p className="text-sm bg-gray-50 p-2 rounded">{selectedPR.notes}</p>
                </div>
              )}

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Medicine</TableHead>
                    <TableHead>Requested</TableHead>
                    <TableHead>Approved</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedPR.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.medicine.nama_obat}</TableCell>
                      <TableCell>{item.quantity_requested}</TableCell>
                      <TableCell>{item.quantity_approved || '-'}</TableCell>
                      <TableCell>{item.unit_price ? `Rp ${item.unit_price}` : '-'}</TableCell>
                      <TableCell>{item.notes || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
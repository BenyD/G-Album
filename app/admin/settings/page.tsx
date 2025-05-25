import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save, Upload, Settings, Mail, Shield, Database } from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="email">Email & Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="permissions">Role Permissions</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Site Configuration
              </CardTitle>
              <CardDescription>Configure basic site settings and branding</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="site-name">Site Name</Label>
                  <Input id="site-name" defaultValue="G Album Studio" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="site-description">Site Description</Label>
                  <Textarea
                    id="site-description"
                    defaultValue="Professional photo album and printing services"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-email">Contact Email</Label>
                  <Input id="contact-email" type="email" defaultValue="contact@galbum.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-phone">Contact Phone</Label>
                  <Input id="contact-phone" defaultValue="+1 (555) 123-4567" />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Branding</h3>
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label>Site Logo</Label>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center">
                        <Settings className="h-8 w-8 text-slate-400" />
                      </div>
                      <Button variant="outline">
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Logo
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="primary-color">Primary Color</Label>
                    <div className="flex items-center gap-2">
                      <Input id="primary-color" type="color" defaultValue="#dc2626" className="w-16 h-10" />
                      <Input defaultValue="#dc2626" className="flex-1" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Configuration
              </CardTitle>
              <CardDescription>Configure SMTP settings and email notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtp-host">SMTP Host</Label>
                  <Input id="smtp-host" placeholder="smtp.gmail.com" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="smtp-port">SMTP Port</Label>
                    <Input id="smtp-port" defaultValue="587" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtp-security">Security</Label>
                    <Select defaultValue="tls">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="tls">TLS</SelectItem>
                        <SelectItem value="ssl">SSL</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp-username">SMTP Username</Label>
                  <Input id="smtp-username" type="email" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp-password">SMTP Password</Label>
                  <Input id="smtp-password" type="password" />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Notification Settings</h3>
                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="notify-new-orders">New Order Notifications</Label>
                      <p className="text-sm text-muted-foreground">Email notifications for new orders</p>
                    </div>
                    <Switch id="notify-new-orders" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="notify-form-submissions">Form Submission Notifications</Label>
                      <p className="text-sm text-muted-foreground">Email notifications for contact form submissions</p>
                    </div>
                    <Switch id="notify-form-submissions" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="notify-newsletter">Newsletter Notifications</Label>
                      <p className="text-sm text-muted-foreground">Email notifications for newsletter events</p>
                    </div>
                    <Switch id="notify-newsletter" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>Configure security options and access controls</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Authentication</h3>
                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="require-2fa">Require Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">Force all users to enable 2FA</p>
                    </div>
                    <Switch id="require-2fa" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="session-timeout">Session Timeout (hours)</Label>
                    <Input id="session-timeout" type="number" defaultValue="24" className="w-32" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="force-logout">Force logout on browser close</Label>
                      <p className="text-sm text-muted-foreground">Automatically log out users when browser closes</p>
                    </div>
                    <Switch id="force-logout" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Password Policy</h3>
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="min-password-length">Minimum Password Length</Label>
                    <Input id="min-password-length" type="number" defaultValue="8" className="w-32" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="require-special-chars">Require Special Characters</Label>
                    <Switch id="require-special-chars" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="require-numbers">Require Numbers</Label>
                    <Switch id="require-numbers" defaultChecked />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-expiry">Password Expiry (days)</Label>
                    <Input id="password-expiry" type="number" defaultValue="90" className="w-32" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Role Permissions</CardTitle>
              <CardDescription>Configure what each role can access (Super Admin only)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-medium mb-4">Admin</h3>
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="admin-albums">Manage Albums</Label>
                      <Switch id="admin-albums" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="admin-gallery">Manage Gallery</Label>
                      <Switch id="admin-gallery" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="admin-newsletter">Manage Newsletter</Label>
                      <Switch id="admin-newsletter" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="admin-submissions">View Form Submissions</Label>
                      <Switch id="admin-submissions" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="admin-analytics">View Analytics</Label>
                      <Switch id="admin-analytics" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="admin-customers">Manage Customers</Label>
                      <Switch id="admin-customers" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="admin-orders">Manage Orders</Label>
                      <Switch id="admin-orders" defaultChecked />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Employee</h3>
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="employee-albums">Manage Albums</Label>
                      <Switch id="employee-albums" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="employee-gallery">Manage Gallery</Label>
                      <Switch id="employee-gallery" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="employee-newsletter">Manage Newsletter</Label>
                      <Switch id="employee-newsletter" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="employee-submissions">View Form Submissions</Label>
                      <Switch id="employee-submissions" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="employee-analytics">View Analytics</Label>
                      <Switch id="employee-analytics" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="employee-customers">Manage Customers</Label>
                      <Switch id="employee-customers" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="employee-orders">Manage Orders</Label>
                      <Switch id="employee-orders" defaultChecked />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <Button>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                System Management
              </CardTitle>
              <CardDescription>System maintenance and backup settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Backup Settings</h3>
                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="auto-backup">Automatic Backups</Label>
                      <p className="text-sm text-muted-foreground">Enable automatic daily backups</p>
                    </div>
                    <Switch id="auto-backup" defaultChecked />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="backup-retention">Backup Retention (days)</Label>
                    <Input id="backup-retention" type="number" defaultValue="30" className="w-32" />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline">Create Backup Now</Button>
                    <Button variant="outline">Restore from Backup</Button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Maintenance</h3>
                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
                      <p className="text-sm text-muted-foreground">Put site in maintenance mode</p>
                    </div>
                    <Switch id="maintenance-mode" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maintenance-message">Maintenance Message</Label>
                    <Textarea
                      id="maintenance-message"
                      defaultValue="We're currently performing scheduled maintenance. Please check back soon."
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline">Clear Cache</Button>
                    <Button variant="outline">Optimize Database</Button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

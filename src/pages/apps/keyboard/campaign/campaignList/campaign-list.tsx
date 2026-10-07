import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { useGetCampaigns } from "@/query/keyboard/useCampaign";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVerticalIcon, Plus } from "lucide-react";
import DeleteCampaign from "../delete-campaign";
import type { Campaign } from "@/utils/schemas/keyboard/campaignSchema";

export default function CampaignList() {
  const navigate = useNavigate();
  const { data: campaigns, isLoading, isError, error } = useGetCampaigns();
  const [deleteOpenId, setDeleteOpenId] = useState<string | null>(null);

  useEffect(() => {
    if (isError && error) {
      toast.error(getErrorMessage(error));
    }
  }, [isError, error]);

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading campaigns...</div>;
  }

  const list: Campaign[] = Array.isArray(campaigns) ? campaigns : [];

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">Campaigns</h1>
          <p className="text-sm text-muted-foreground">Manage your keyboard campaigns</p>
        </div>
        <Button onClick={() => navigate("/keyboard/campaign/add")}>
          <Plus className="mr-2 h-4 w-4" /> Add Campaign
        </Button>
      </div>

      <div className="border border-border rounded-xl shadow-sm bg-card overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-16">Icon</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Link</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No campaigns found.
                </TableCell>
              </TableRow>
            ) : (
              list.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell>
                    <img src={campaign.iconLink} alt={campaign.name} className="w-10 h-10 rounded-md object-cover bg-muted" />
                  </TableCell>
                  <TableCell className="font-medium">{campaign.name}</TableCell>
                  <TableCell>
                    <a href={campaign.link} target="_blank" rel="noreferrer" className="text-primary hover:underline transition-all">
                      {campaign.link.length > 30 ? campaign.link.substring(0, 30) + '...' : campaign.link}
                    </a>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(campaign.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger render={
                        <Button variant="ghost" size="icon">
                          <MoreVerticalIcon className="h-4 w-4" />
                        </Button>
                      } />
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/keyboard/campaign/update/${campaign.id}`)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer" onClick={() => setDeleteOpenId(campaign.id)}>
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <DeleteCampaign 
                      campaign={campaign} 
                      open={deleteOpenId === campaign.id} 
                      onOpenChange={(open) => setDeleteOpenId(open ? campaign.id : null)} 
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { LocationSelector } from "@/components/location-selector";
import { API_URL } from "@/lib/config";
import { toast } from "sonner";

export interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: "volunteer" | "rescue";
  onSuccess?: () => void;
}

const SKILLS_LIST = [
  "First Aid",
  "Medical Support",
  "Search & Rescue",
  "Food Distribution",
  "Logistics",
  "Emergency Communication",
  "Shelter Management",
];

export function CreateUserDialog({ open, onOpenChange, role, onSuccess }: CreateUserDialogProps) {
  // Core/Common Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [state, setState] = useState("Maharashtra");
  const [district, setDistrict] = useState("Mumbai");
  const [address, setAddress] = useState("");

  // Volunteer Fields
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("Male");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [availability, setAvailability] = useState<"Full Time" | "Part Time" | "Weekends">(
    "Part Time",
  );
  const [volunteerExperience, setVolunteerExperience] = useState("");

  // Rescue Fields
  const [orgName, setOrgName] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [designation, setDesignation] = useState("Medical Responder");
  const [experienceYears, setExperienceYears] = useState("");
  const [specialization, setSpecialization] = useState("Search & Rescue");

  // Emergency Contact (Shared)
  const [emergName, setEmergName] = useState("");
  const [emergNumber, setEmergNumber] = useState("");

  const [submitting, setSubmitting] = useState(false);

  // Reset fields on open/role change
  useEffect(() => {
    if (open) {
      setName("");
      setEmail("");
      setMobileNumber("");
      setPassword("");
      setConfirmPassword("");
      setState("Maharashtra");
      setDistrict("Mumbai");
      setAddress("");
      setAge("");
      setGender("Male");
      setSelectedSkills([]);
      setAvailability("Part Time");
      setVolunteerExperience("");
      setOrgName("");
      setEmployeeId("");
      setDesignation("Medical Responder");
      setExperienceYears("");
      setSpecialization("Search & Rescue");
      setEmergName("");
      setEmergNumber("");
    }
  }, [open, role]);

  const handleSkillChange = (skill: string, checked: boolean) => {
    if (checked) {
      setSelectedSkills((prev) => [...prev, skill]);
    } else {
      setSelectedSkills((prev) => prev.filter((s) => s !== skill));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !mobileNumber || !password || !confirmPassword || !state || !district) {
      toast.error("Please fill in all common fields");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (mobileNumber.length < 10) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }

    const payload: any = {
      name,
      email,
      mobileNumber,
      password,
      role,
      state,
      district,
      address: address || `Created by Command, ${district}, ${state}`,
      emergencyContactName: emergName,
      emergencyContactNumber: emergNumber,
    };

    if (role === "volunteer") {
      if (!age || !gender || !availability || !emergName || !emergNumber) {
        toast.error("Please fill in all volunteer details");
        return;
      }
      payload.age = parseInt(age);
      payload.gender = gender;
      payload.skills = selectedSkills;
      payload.availability = availability;
      payload.volunteerExperience = volunteerExperience;
    } else if (role === "rescue") {
      if (
        !orgName ||
        !employeeId ||
        !designation ||
        !experienceYears ||
        !specialization ||
        !emergName ||
        !emergNumber
      ) {
        toast.error("Please fill in all rescue team details");
        return;
      }
      payload.organizationName = orgName;
      payload.employeeId = employeeId;
      payload.designation = designation;
      payload.yearsOfExperience = parseInt(experienceYears);
      payload.specialization = specialization;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem("resqnet.token");
      const res = await fetch(`${API_URL}/api/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to create user");
      }

      toast.success(
        `Successfully created ${role === "volunteer" ? "Volunteer" : "Rescue Team Member"} ${name}`,
      );
      onOpenChange(false);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Error creating user");
    } finally {
      setSubmitting(false);
    }
  };

  const titleText = role === "volunteer" ? "Add Volunteer" : "Add Rescue Team";
  const descText =
    role === "volunteer"
      ? "Create a trusted Volunteer account. This account will be approved automatically."
      : "Create a trusted Rescue Team account. This account will be approved automatically.";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl rounded-2xl glass-strong border shadow-elegant max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{titleText}</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {descText}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-3 text-sm">
          {/* Common fields block 1 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="cName">Full Name</Label>
              <Input id="cName" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="cMobile">Mobile Number</Label>
              <Input
                id="cMobile"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder="10-digit number"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="cEmail">Email Address</Label>
            <Input
              id="cEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
            />
          </div>

          {/* Location fields */}
          <LocationSelector
            selectedState={state}
            onStateChange={setState}
            selectedDistrict={district}
            onDistrictChange={setDistrict}
          />

          <div className="space-y-1">
            <Label htmlFor="cAddress">Address (Optional)</Label>
            <Input
              id="cAddress"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Street, Flat, Area"
            />
          </div>

          {/* Volunteer specific fields */}
          {role === "volunteer" && (
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Volunteer Details
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="vAge">Age</Label>
                  <Input
                    id="vAge"
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="vGender">Gender</Label>
                  <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger id="vGender" className="h-10">
                      <SelectValue placeholder="Gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Skills (Multi-Select)</Label>
                <div className="grid grid-cols-2 gap-2 mt-1 border rounded-xl p-3 bg-muted/20">
                  {SKILLS_LIST.map((s) => (
                    <div key={s} className="flex items-center gap-2">
                      <Checkbox
                        id={`d-skill-${s}`}
                        checked={selectedSkills.includes(s)}
                        onCheckedChange={(checked) => handleSkillChange(s, !!checked)}
                      />
                      <label
                        htmlFor={`d-skill-${s}`}
                        className="text-xs font-medium cursor-pointer"
                      >
                        {s}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="vAvailability">Availability</Label>
                <Select value={availability} onValueChange={(val) => setAvailability(val as any)}>
                  <SelectTrigger id="vAvailability" className="h-10">
                    <SelectValue placeholder="Availability" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Full Time">Full Time</SelectItem>
                    <SelectItem value="Part Time">Part Time</SelectItem>
                    <SelectItem value="Weekends">Weekends</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="vVolExp">Prior Volunteer Experience (Optional)</Label>
                <Input
                  id="vVolExp"
                  value={volunteerExperience}
                  onChange={(e) => setVolunteerExperience(e.target.value)}
                  placeholder="Brief description"
                />
              </div>
            </div>
          )}

          {/* Rescue specific fields */}
          {role === "rescue" && (
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Rescue Team Details
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="rOrgName">Organization Name</Label>
                  <Input
                    id="rOrgName"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="rEmpId">Employee / Officer ID</Label>
                  <Input
                    id="rEmpId"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="rDesignation">Designation</Label>
                  <Select value={designation} onValueChange={setDesignation}>
                    <SelectTrigger id="rDesignation" className="h-10">
                      <SelectValue placeholder="Designation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Fire Officer">Fire Officer</SelectItem>
                      <SelectItem value="Medical Responder">Medical Responder</SelectItem>
                      <SelectItem value="Police Officer">Police Officer</SelectItem>
                      <SelectItem value="Disaster Response Officer">
                        Disaster Response Officer
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="rExpYears">Years of Experience</Label>
                  <Input
                    id="rExpYears"
                    type="number"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="rSpecialization">Active Specialization</Label>
                <Select value={specialization} onValueChange={setSpecialization}>
                  <SelectTrigger id="rSpecialization" className="h-10">
                    <SelectValue placeholder="Specialization" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Flood Rescue">Flood Rescue</SelectItem>
                    <SelectItem value="Fire Rescue">Fire Rescue</SelectItem>
                    <SelectItem value="Medical Emergency">Medical Emergency</SelectItem>
                    <SelectItem value="Search & Rescue">Search & Rescue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Emergency Contact Block (Shared) */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Emergency Contact
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="cEmergName">Contact Name</Label>
                <Input
                  id="cEmergName"
                  value={emergName}
                  onChange={(e) => setEmergName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="cEmergNumber">Contact Phone</Label>
                <Input
                  id="cEmergNumber"
                  value={emergNumber}
                  onChange={(e) => setEmergNumber(e.target.value)}
                  placeholder="10-digit number"
                  required
                />
              </div>
            </div>
          </div>

          {/* Passwords */}
          <div className="grid grid-cols-2 gap-3 border-t pt-4">
            <div className="space-y-1">
              <Label htmlFor="cPw">Password</Label>
              <Input
                id="cPw"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="cConfirmPw">Confirm Password</Label>
              <Input
                id="cConfirmPw"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <DialogFooter className="border-t pt-4">
            <Button
              type="button"
              variant="ghost"
              className="rounded-full"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" className="rounded-full shadow-glow" disabled={submitting}>
              {submitting ? "Creating..." : "Create Account"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

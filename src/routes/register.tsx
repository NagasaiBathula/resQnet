import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Logo } from "@/components/logo";
import { useAuth, roleHome } from "@/lib/auth";
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
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  User,
  HeartHandshake,
  Truck,
      ShieldAlert,
    } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { type Role } from "@/lib/mock-data";
import { Checkbox } from "@/components/ui/checkbox";
import { LocationSelector } from "@/components/location-selector";
import {} from "@/lib/config";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Register — ResQNet" }] }),
  component: RegisterPage,
});

const SKILLS_LIST = [
  "First Aid",
  "Medical Support",
  "Search & Rescue",
  "Food Distribution",
  "Logistics",
  "Emergency Communication",
  "Shelter Management",
];

function RegisterPage() {
  const { registerUser, user } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>("citizen");

  // Core Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [state, setState] = useState("Maharashtra");
  const [district, setDistrict] = useState("Mumbai");
  const [address, setAddress] = useState("");

  // Volunteer Specific
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("Male");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [availability, setAvailability] = useState<"Full Time" | "Part Time" | "Weekends">(
    "Part Time",
  );
  const [volunteerExperience, setVolunteerExperience] = useState("");
  const [emergName, setEmergName] = useState("");
  const [emergNumber, setEmergNumber] = useState("");

  // Rescue Specific
  const [orgName, setOrgName] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [designation, setDesignation] = useState("Medical Responder");
  const [experienceYears, setExperienceYears] = useState("");
  const [specialization, setSpecialization] = useState("Search & Rescue");
  const [docMetadata, setDocMetadata] = useState<{ fileName: string; fileType: string } | null>(
    null,
  );

  useEffect(() => {
    if (user) {
      navigate({ to: roleHome(user.role), replace: true });
    }
  }, [user, navigate]);

  if (user) {
    return null;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Unsupported file type. Please select a JPG, PNG, or PDF file.");
        return;
      }
      setDocMetadata({
        fileName: file.name,
        fileType: file.type,
      });
      toast.success(`Selected file: ${file.name}`);
    }
  };

  const handleSkillChange = (skill: string, checked: boolean) => {
    if (checked) {
      setSelectedSkills((prev) => [...prev, skill]);
    } else {
      setSelectedSkills((prev) => prev.filter((s) => s !== skill));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    if (
      !name ||
      !email ||
      !mobileNumber ||
      !password ||
      !confirmPassword ||
      !state ||
      !district ||
      !address
    ) {
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

    // Role-specific payload details
    let rolePayload: any = {
      name,
      email,
      mobileNumber,
      password,
      role,
      state,
      district,
      address,
    };

    if (role === "volunteer") {
      if (!age || !gender || !availability || !emergName || !emergNumber) {
        toast.error("Please fill in all volunteer details");
        return;
      }
      rolePayload = {
        ...rolePayload,
        age: parseInt(age),
        gender,
        skills: selectedSkills,
        availability,
        volunteerExperience,
        emergencyContactName: emergName,
        emergencyContactNumber: emergNumber,
      };
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
      if (!docMetadata) {
        toast.error("Please select an official ID document");
        return;
      }
      rolePayload = {
        ...rolePayload,
        organizationName: orgName,
        employeeId,
        designation,
        yearsOfExperience: parseInt(experienceYears),
        specialization,
        officialIdDocument: docMetadata,
        emergencyContactName: emergName,
        emergencyContactNumber: emergNumber,
      };
    }

    try {
      const r = await registerUser(rolePayload);

      if (!r.ok) {
        toast.error(r.error || "Registration failed");
        return;
      }

      if (r.status === "pending") {
        if (role === "volunteer") {
          toast.info("Your volunteer application has been submitted and is awaiting approval.", {
            duration: 6000,
          });
        } else if (role === "rescue") {
          toast.info("Your rescue team application has been submitted and is awaiting approval.", {
            duration: 6000,
          });
        }
        navigate({ to: "/login" });
      } else {
        toast.success("Registration successful! Welcome to ResQNet AI.");
        navigate({ to: "/citizen" });
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Error during registration");
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left brand panel */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden">
        <div className="absolute inset-0 gradient-mesh opacity-90" />
        <div className="relative">
          <Link to="/" className="flex items-center gap-2">
            <Logo size={36} className="shadow-glow" />
            <span className="font-semibold tracking-tight">ResQNet</span>
          </Link>
        </div>
        <div className="relative">
          <h2 className="text-4xl font-bold tracking-tight leading-tight">
            Join the network.
            <br />
            Save lives.
          </h2>
          <p className="mt-4 text-muted-foreground max-w-md">
            Register today to receive immediate AI emergency assistance, coordinate with rescue
            teams, or join as a volunteer.
          </p>
          <div className="mt-8 flex items-center gap-3 text-xs text-muted-foreground">
            <Badge
              variant="outline"
              className="rounded-full gap-1.5 bg-background/60 backdrop-blur"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" /> Live network
            </Badge>
            <span>·</span>
            <span>v2.4 · Secure signup</span>
          </div>
        </div>
        <div className="relative text-xs text-muted-foreground">
          © 2026 ResQNet · All systems nominal
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex flex-col p-4 md:p-8 lg:p-10 bg-background max-h-screen overflow-y-auto">
        <Link to="/" className="lg:hidden flex items-center gap-2 mb-6">
          <Logo size={32} />
          <span className="font-semibold tracking-tight">ResQNet</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 flex flex-col justify-center max-w-lg mx-auto w-full"
        >
          <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Start using the disaster response ecosystem.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {/* Common Block 1 */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="mobile">Mobile Number</Label>
                <Input
                  id="mobile"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="10-digit number"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="role">Select Workspace Role</Label>
              <Select value={role} onValueChange={(val) => setRole(val as Role)}>
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="citizen">
                    <span className="flex items-center gap-2">
                      <User className="h-4 w-4 text-primary" /> Citizen (Request/Report Emergency)
                    </span>
                  </SelectItem>
                  <SelectItem value="volunteer">
                    <span className="flex items-center gap-2">
                      <HeartHandshake className="h-4 w-4 text-success" /> Volunteer (Assist Relief
                      Teams)
                    </span>
                  </SelectItem>
                  <SelectItem value="rescue">
                    <span className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-emergency" /> Rescue Team (First Responder)
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>

              {role === "volunteer" && (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-semibold flex items-center gap-1">
                  <ShieldAlert className="h-3.5 w-3.5" /> Volunteer accounts require approval before
                  activation.
                </p>
              )}
              {role === "rescue" && (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-semibold flex items-center gap-1">
                  <ShieldAlert className="h-3.5 w-3.5" /> Rescue Team accounts require approval
                  before activation.
                </p>
              )}
            </div>

            {/* Common Block 2: Location */}
            <LocationSelector
              selectedState={state}
              onStateChange={setState}
              selectedDistrict={district}
              onDistrictChange={setDistrict}
            />

            <div className="space-y-1">
              <Label htmlFor="address">Full Address</Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Flat, Street, Area"
                required
              />
            </div>

            {/* Dynamic Content */}
            <AnimatePresence mode="wait">
              {role === "volunteer" && (
                <motion.div
                  key="volunteer-fields"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 border-t pt-4"
                >
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                    Volunteer Profile Form
                  </h3>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="age">Age</Label>
                      <Input
                        id="age"
                        type="number"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        placeholder="e.g. 24"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="gender">Gender</Label>
                      <Select value={gender} onValueChange={setGender}>
                        <SelectTrigger className="h-10">
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
                    <Label>Specialized Aid Skills (Multi-Select)</Label>
                    <div className="grid grid-cols-2 gap-2 mt-1 border rounded-xl p-3 bg-muted/20">
                      {SKILLS_LIST.map((s) => (
                        <div key={s} className="flex items-center gap-2">
                          <Checkbox
                            id={`skill-${s}`}
                            checked={selectedSkills.includes(s)}
                            onCheckedChange={(checked) => handleSkillChange(s, !!checked)}
                          />
                          <label
                            htmlFor={`skill-${s}`}
                            className="text-xs font-medium cursor-pointer"
                          >
                            {s}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="availability">Availability</Label>
                    <Select
                      value={availability}
                      onValueChange={(val) => setAvailability(val as any)}
                    >
                      <SelectTrigger className="h-10">
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
                    <Label htmlFor="volExp">Prior Volunteer Experience (Optional)</Label>
                    <Input
                      id="volExp"
                      value={volunteerExperience}
                      onChange={(e) => setVolunteerExperience(e.target.value)}
                      placeholder="Brief description of past aid operations"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="vEmergName">Emergency Contact Name</Label>
                      <Input
                        id="vEmergName"
                        value={emergName}
                        onChange={(e) => setEmergName(e.target.value)}
                        placeholder="Contact Name"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="vEmergNumber">Emergency Contact Phone</Label>
                      <Input
                        id="vEmergNumber"
                        value={emergNumber}
                        onChange={(e) => setEmergNumber(e.target.value)}
                        placeholder="Phone Number"
                        required
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {role === "rescue" && (
                <motion.div
                  key="rescue-fields"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 border-t pt-4"
                >
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                    Rescue Responder Profile Form
                  </h3>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="orgName">Organization Name</Label>
                      <Input
                        id="orgName"
                        value={orgName}
                        onChange={(e) => setOrgName(e.target.value)}
                        placeholder="e.g. NDRF, Fire Dept"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="empId">Employee / Officer ID</Label>
                      <Input
                        id="empId"
                        value={employeeId}
                        onChange={(e) => setEmployeeId(e.target.value)}
                        placeholder="ID Code"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="designation">Designation</Label>
                      <Select value={designation} onValueChange={setDesignation}>
                        <SelectTrigger className="h-10">
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
                      <Label htmlFor="expYears">Years of Experience</Label>
                      <Input
                        id="expYears"
                        type="number"
                        value={experienceYears}
                        onChange={(e) => setExperienceYears(e.target.value)}
                        placeholder="e.g. 5"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="specialization">Active Specialization</Label>
                    <Select value={specialization} onValueChange={setSpecialization}>
                      <SelectTrigger className="h-10">
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

                  <div className="space-y-1.5">
                    <Label htmlFor="idDoc">Official ID Document Upload (JPG, PNG, PDF)</Label>
                    <div className="flex items-center gap-3 border border-dashed rounded-xl p-3 bg-muted/10">
                      <Input
                        id="idDoc"
                        type="file"
                        onChange={handleFileChange}
                        className="h-10 pt-1.5 text-xs border-0 file:rounded-md file:bg-primary file:text-primary-foreground"
                        accept=".jpg,.jpeg,.png,.pdf"
                        required
                      />
                    </div>
                    {docMetadata && (
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Selected: <span className="font-semibold">{docMetadata.fileName}</span> (
                        {docMetadata.fileType})
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="rEmergName">Emergency Contact Name</Label>
                      <Input
                        id="rEmergName"
                        value={emergName}
                        onChange={(e) => setEmergName(e.target.value)}
                        placeholder="Contact Name"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="rEmergNumber">Emergency Contact Phone</Label>
                      <Input
                        id="rEmergNumber"
                        value={emergNumber}
                        onChange={(e) => setEmergNumber(e.target.value)}
                        placeholder="Phone Number"
                        required
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Password Block */}
            <div className="grid grid-cols-2 gap-3 border-t pt-4">
              <div className="space-y-1">
                <Label htmlFor="pw">Password</Label>
                <Input
                  id="pw"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="confirmPw">Confirm Password</Label>
                <Input
                  id="confirmPw"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full h-11 rounded-xl shadow-glow">
              Register account <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </form>

          <div className="mt-5 text-center text-sm">
            <span className="text-muted-foreground">Already have an account? </span>
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Sign in
            </Link>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            By continuing you agree to our{" "}
            <a className="underline hover:text-foreground" href="#">
              Terms
            </a>{" "}
            &{" "}
            <a className="underline hover:text-foreground" href="#">
              Privacy
            </a>
            .
          </p>
        </motion.div>
      </div>
    </div>
  );
}
